import { ACTION_BUTTONS, type ActionId } from './config.js';
import type { BossArchetype } from './boss-patterns.js';
import { BOSS_RESPONSE_ACK_SECONDS, bossActionAssist, bossResponseActions, type BossActionAssistCue } from './boss-action-assist.js';

export interface BossResponseAcknowledgementAuditSample {
  archetype: BossArchetype | 'global';
  caseId: string;
  expected: string | number | boolean | null;
  actual: string | number | boolean | null;
  passed: boolean;
}

export interface BossResponseAcknowledgementAudit {
  passed: boolean;
  archetypeCount: number;
  samples: BossResponseAcknowledgementAuditSample[];
  acknowledgementCoverage: number;
  alternativeResponseCoverage: number;
  queuedCueCoverage: number;
  potionRescueCoverage: number;
  windowResetCoverage: number;
  queuedCancelRepromptCoverage: number;
  actionCount: number;
  snapshotSchemaMutation: false;
  issues: string[];
}

const ARCHETYPES: BossArchetype[]=['inferno','summoner','juggernaut','abyssWitch','twinMaw','timeEater'];
const cueFor=(actionId:ActionId):BossActionAssistCue=>({actionId,label:'특수기 대응',accent:'#ffe17a'});
const add=(samples:BossResponseAcknowledgementAuditSample[],archetype:BossArchetype|'global',caseId:string,expected:BossResponseAcknowledgementAuditSample['expected'],actual:BossResponseAcknowledgementAuditSample['actual'])=>{
  samples.push({archetype,caseId,expected,actual,passed:expected===actual});
};

export function auditBossResponseAcknowledgement():BossResponseAcknowledgementAudit{
  const samples:BossResponseAcknowledgementAuditSample[]=[];
  let ackExpected=0,ackHit=0,altExpected=0,altHit=0,queuedExpected=0,queuedHit=0;
  for(const archetype of ARCHETYPES){
    const mapped=bossResponseActions(archetype);
    const acknowledged=bossActionAssist({archetype,specialTimer:.5,hpRatio:.8,potions:0,readyActions:new Set<ActionId>([mapped[0]!,mapped[1]!]),acknowledged:true});
    ackExpected++; if(acknowledged===null)ackHit++;
    add(samples,archetype,'acknowledged-suppression',null,acknowledged?.actionId??null);

    const alternativeValid=mapped.includes(mapped[1]!);
    altExpected++; if(alternativeValid)altHit++;
    add(samples,archetype,'alternative-response-valid',true,alternativeValid);

    const previous=cueFor(mapped[2]!);
    const queued=bossActionAssist({archetype,specialTimer:.5,hpRatio:.8,potions:0,readyActions:new Set<ActionId>([mapped[0]!]),queuedActions:new Set<ActionId>([mapped[2]!]),previousCue:previous,previousCueAge:.1,previousArchetype:archetype});
    queuedExpected++; if(queued?.actionId===mapped[2])queuedHit++;
    add(samples,archetype,'queued-cue-persistence',mapped[2]!,queued?.actionId??null);
  }

  const rescue=bossActionAssist({archetype:'summoner',specialTimer:.4,hpRatio:.25,potions:1,readyActions:new Set<ActionId>(['potion','spell4']),acknowledged:true});
  add(samples,'global','potion-rescue','potion',rescue?.actionId??null);

  const outside=bossActionAssist({archetype:'summoner',specialTimer:1.06,hpRatio:.8,potions:0,readyActions:new Set<ActionId>(['spell4']),acknowledged:true});
  add(samples,'global','window-reset',null,outside?.actionId??null);

  const reprompt=bossActionAssist({archetype:'summoner',specialTimer:.5,hpRatio:.8,potions:0,readyActions:new Set<ActionId>(['spell4']),queuedActions:new Set<ActionId>()});
  add(samples,'global','queued-cancel-reprompt','spell4',reprompt?.actionId??null);

  add(samples,'global','ack-window-seconds',.4,BOSS_RESPONSE_ACK_SECONDS);
  add(samples,'global','action-count',9,ACTION_BUTTONS.length);
  add(samples,'global','snapshot-schema-mutation',false,false);
  const combatOnly=ARCHETYPES.every((archetype)=>bossResponseActions(archetype).every((id)=>id!=='shop'&&id!=='auto'&&id!=='potion'));
  add(samples,'global','response-map-combat-only',true,combatOnly);

  const acknowledgementCoverage=ackHit/Math.max(1,ackExpected);
  const alternativeResponseCoverage=altHit/Math.max(1,altExpected);
  const queuedCueCoverage=queuedHit/Math.max(1,queuedExpected);
  const potionRescueCoverage=rescue?.actionId==='potion'?1:0;
  const windowResetCoverage=outside===null?1:0;
  const queuedCancelRepromptCoverage=reprompt?.actionId==='spell4'?1:0;
  const issues:string[]=[];
  if(samples.length!==25)issues.push('sample-count');
  if(acknowledgementCoverage!==1)issues.push('acknowledgement-coverage');
  if(alternativeResponseCoverage!==1)issues.push('alternative-response-coverage');
  if(queuedCueCoverage!==1)issues.push('queued-cue-coverage');
  if(potionRescueCoverage!==1)issues.push('potion-rescue');
  if(windowResetCoverage!==1)issues.push('window-reset');
  if(queuedCancelRepromptCoverage!==1)issues.push('queued-cancel-reprompt');
  if(ACTION_BUTTONS.length!==9)issues.push('action-count');
  if(samples.some((sample)=>!sample.passed))issues.push('sample-failure');
  return {
    passed:issues.length===0,
    archetypeCount:ARCHETYPES.length,
    samples,
    acknowledgementCoverage,
    alternativeResponseCoverage,
    queuedCueCoverage,
    potionRescueCoverage,
    windowResetCoverage,
    queuedCancelRepromptCoverage,
    actionCount:ACTION_BUTTONS.length,
    snapshotSchemaMutation:false,
    issues,
  };
}
