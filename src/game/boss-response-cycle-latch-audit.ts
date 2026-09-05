import { ACTION_BUTTONS, type ActionId } from './config.js';
import type { BossArchetype } from './boss-patterns.js';
import { bossActionAssist, bossResponseActions } from './boss-action-assist.js';

export interface BossResponseCycleLatchAuditSample {
  archetype: BossArchetype | 'global';
  caseId: string;
  expected: string | number | boolean | null;
  actual: string | number | boolean | null;
  passed: boolean;
}

export interface BossResponseCycleLatchAudit {
  passed: boolean;
  archetypeCount: number;
  samples: BossResponseCycleLatchAuditSample[];
  sameCycleRepromptRate: number;
  nextCycleRepromptCoverage: number;
  potionRescueCoverage: number;
  actionCount: number;
  snapshotSchemaMutation: false;
  issues: string[];
}

const ARCHETYPES: BossArchetype[]=['inferno','summoner','juggernaut','abyssWitch','twinMaw','timeEater'];
const add=(samples:BossResponseCycleLatchAuditSample[],archetype:BossArchetype|'global',caseId:string,expected:BossResponseCycleLatchAuditSample['expected'],actual:BossResponseCycleLatchAuditSample['actual'])=>{
  samples.push({archetype,caseId,expected,actual,passed:expected===actual});
};

export function auditBossResponseCycleLatch():BossResponseCycleLatchAudit{
  const samples:BossResponseCycleLatchAuditSample[]=[];
  let sameCyclePrompts=0,sameCycleChecks=0,nextExpected=0,nextHit=0,rescueExpected=0,rescueHit=0;
  for(const archetype of ARCHETYPES){
    const mapped=bossResponseActions(archetype);
    const ready=new Set<ActionId>([mapped[0]!,mapped[1]!]);

    const early=bossActionAssist({archetype,specialTimer:1.0,hpRatio:.8,potions:0,readyActions:ready,acknowledged:false,cycleAcknowledged:true});
    sameCycleChecks++; if(early) sameCyclePrompts++;
    add(samples,archetype,'same-cycle-early',null,early?.actionId??null);

    const late=bossActionAssist({archetype,specialTimer:.2,hpRatio:.8,potions:0,readyActions:ready,acknowledged:false,cycleAcknowledged:true});
    sameCycleChecks++; if(late) sameCyclePrompts++;
    add(samples,archetype,'same-cycle-late',null,late?.actionId??null);

    const next=bossActionAssist({archetype,specialTimer:.9,hpRatio:.8,potions:0,readyActions:ready,acknowledged:false,cycleAcknowledged:false});
    nextExpected++; if(next?.actionId===mapped[0]) nextHit++;
    add(samples,archetype,'next-cycle-reprompt',mapped[0]!,next?.actionId??null);

    const rescue=bossActionAssist({archetype,specialTimer:.2,hpRatio:.25,potions:1,readyActions:new Set<ActionId>(['potion',mapped[0]!]),acknowledged:false,cycleAcknowledged:true});
    rescueExpected++; if(rescue?.actionId==='potion') rescueHit++;
    add(samples,archetype,'same-cycle-potion-rescue','potion',rescue?.actionId??null);
  }

  const responseMapCombatOnly=ARCHETYPES.every((archetype)=>bossResponseActions(archetype).every((id)=>id!=='shop'&&id!=='auto'&&id!=='potion'));
  const frozenInvariants=ACTION_BUTTONS.length===9&&responseMapCombatOnly;
  add(samples,'global','frozen-invariants',true,frozenInvariants);

  const sameCycleRepromptRate=sameCyclePrompts/Math.max(1,sameCycleChecks);
  const nextCycleRepromptCoverage=nextHit/Math.max(1,nextExpected);
  const potionRescueCoverage=rescueHit/Math.max(1,rescueExpected);
  const issues:string[]=[];
  if(samples.length!==25)issues.push('sample-count');
  if(sameCycleRepromptRate!==0)issues.push('same-cycle-reprompt');
  if(nextCycleRepromptCoverage!==1)issues.push('next-cycle-reprompt');
  if(potionRescueCoverage!==1)issues.push('potion-rescue');
  if(ACTION_BUTTONS.length!==9)issues.push('action-count');
  if(!responseMapCombatOnly)issues.push('response-map');
  if(samples.some((sample)=>!sample.passed))issues.push('sample-failure');
  return {
    passed:issues.length===0,
    archetypeCount:ARCHETYPES.length,
    samples,
    sameCycleRepromptRate,
    nextCycleRepromptCoverage,
    potionRescueCoverage,
    actionCount:ACTION_BUTTONS.length,
    snapshotSchemaMutation:false,
    issues,
  };
}
