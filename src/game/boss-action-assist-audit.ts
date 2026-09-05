import type { ActionId } from './config.js';
import type { BossArchetype } from './boss-patterns.js';
import { bossActionAssist, bossResponseActions } from './boss-action-assist.js';
export interface BossActionAssistAuditSample{archetype:BossArchetype;caseId:string;expected:boolean;actual:boolean;actionId:ActionId|null;}
export interface BossActionAssistAudit{passed:boolean;archetypeCount:number;samples:BossActionAssistAuditSample[];responseCoverage:number;potionRescueCoverage:number;earlyFalsePromptCount:number;multiActionViolations:number;issues:string[];}
const ARCHETYPES:BossArchetype[]=['inferno','summoner','juggernaut','abyssWitch','twinMaw','timeEater'];
function round4(v:number):number{return Math.round(v*10000)/10000;}
export function auditBossActionAssist():BossActionAssistAudit{
  const samples:BossActionAssistAuditSample[]=[];let responseExpected=0,responseHit=0,potionExpected=0,potionHit=0,earlyFalsePromptCount=0,multiActionViolations=0;
  for(const archetype of ARCHETYPES){
    const mapped=bossResponseActions(archetype);
    const readySets:readonly [string,ReadonlySet<ActionId>][]=[['all',new Set<ActionId>(['spell1','spell2','spell3','spell4','ultimate1','ultimate2'])],['first',new Set<ActionId>([mapped[0]!])],['second',new Set<ActionId>([mapped[1]!,mapped[2]!])],['none',new Set<ActionId>()]];
    for(const [caseId,readyActions] of readySets){
      const expected=readyActions.size>0;const cue=bossActionAssist({archetype,specialTimer:.55,hpRatio:.8,potions:0,readyActions});
      samples.push({archetype,caseId,expected,actual:Boolean(cue),actionId:cue?.actionId??null});
      if(expected){responseExpected++;if(cue)responseHit++;}
      if(cue&&![...readyActions].includes(cue.actionId))multiActionViolations++;
    }
    const rescue=bossActionAssist({archetype,specialTimer:.45,hpRatio:.25,potions:1,readyActions:new Set<ActionId>(['potion'])});
    potionExpected++;if(rescue?.actionId==='potion')potionHit++;samples.push({archetype,caseId:'potion',expected:true,actual:Boolean(rescue),actionId:rescue?.actionId??null});
    const early=bossActionAssist({archetype,specialTimer:1.4,hpRatio:.2,potions:1,readyActions:new Set<ActionId>(['potion',mapped[0]!])});
    if(early)earlyFalsePromptCount++;samples.push({archetype,caseId:'early',expected:false,actual:Boolean(early),actionId:early?.actionId??null});
    const boundary=bossActionAssist({archetype,specialTimer:1.0,hpRatio:.8,potions:0,readyActions:new Set<ActionId>(mapped)});
    responseExpected++;if(boundary)responseHit++;samples.push({archetype,caseId:'boundary',expected:true,actual:Boolean(boundary),actionId:boundary?.actionId??null});
    const critical=bossActionAssist({archetype,specialTimer:.2,hpRatio:.8,potions:0,readyActions:new Set<ActionId>(mapped)});
    responseExpected++;if(critical)responseHit++;samples.push({archetype,caseId:'critical',expected:true,actual:Boolean(critical),actionId:critical?.actionId??null});
  }
  const responseCoverage=round4(responseHit/Math.max(1,responseExpected)),potionRescueCoverage=round4(potionHit/Math.max(1,potionExpected));
  const issues:string[]=[];if(responseCoverage<.98)issues.push('response-coverage');if(potionRescueCoverage<.99)issues.push('potion-rescue');if(earlyFalsePromptCount)issues.push('early-false-prompts');if(multiActionViolations)issues.push('invalid-action');
  return{passed:issues.length===0,archetypeCount:ARCHETYPES.length,samples,responseCoverage,potionRescueCoverage,earlyFalsePromptCount,multiActionViolations,issues};
}
