import { ACTION_BUTTONS } from './config.js';
import { buildCompletionSpeedSamples } from './build-completion-speed-audit.js';
import { auditMidgameBuildVelocity } from './midgame-build-velocity-audit.js';
import { auditFirstThirtyFlowHealth } from './first-thirty-flow-health-audit.js';

export interface ReleasePlayJourneyAudit {
  samples:number;
  combinations:number;
  checkpoints:number[];
  minTwentyMinuteProgress:number;
  maxCompletionMinute:number;
  buildVelocityPassed:boolean;
  flowHealthPassed:boolean;
  blockingDeadEnds:number;
  actionCount:number;
  snapshotMutation:false;
  passed:boolean;
}
function round(value:number):number{return Math.round(value*1000)/1000;}
export function auditReleasePlayJourney():ReleasePlayJourneyAudit{
  const checkpoints=[20,25,30];
  const samples=buildCompletionSpeedSamples().filter(sample=>checkpoints.includes(sample.minute));
  const keys=new Set(samples.map(sample=>`${sample.heroId}|${sample.archetype}|${sample.threat}`));
  let minTwentyMinuteProgress=1;
  for(const key of keys){
    const at20=samples.find(sample=>sample.minute===20&&`${sample.heroId}|${sample.archetype}|${sample.threat}`===key);
    minTwentyMinuteProgress=Math.min(minTwentyMinuteProgress,at20?.completionProgress??0);
  }
  const velocity=auditMidgameBuildVelocity();
  const flow=auditFirstThirtyFlowHealth();
  const blockingDeadEnds=flow.passed&&velocity.passed?0:1;
  const actionCount=ACTION_BUTTONS.length;
  const passed=samples.length===144&&keys.size===48&&minTwentyMinuteProgress>=.85&&velocity.maxCompletionMinute<=25&&velocity.passed&&flow.passed&&blockingDeadEnds===0&&actionCount===9;
  return{samples:samples.length,combinations:keys.size,checkpoints,minTwentyMinuteProgress:round(minTwentyMinuteProgress),maxCompletionMinute:velocity.maxCompletionMinute,buildVelocityPassed:velocity.passed,flowHealthPassed:flow.passed,blockingDeadEnds,actionCount,snapshotMutation:false,passed};
}
