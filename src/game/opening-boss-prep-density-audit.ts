import { openingBossPrepAssist } from './opening-boss-prep.js';
import type { ActionId } from './config.js';
export interface OpeningBossPrepDensityAudit{passed:boolean;samples:number;maxConcurrentCues:number;falsePositiveCount:number;preparedSilenceCoverage:number;cueActions:Extract<ActionId,'shop'|'potion'>[];issues:string[];}
export function auditOpeningBossPrepDensity():OpeningBossPrepDensityAudit{
  const samples=[] as {countdown:number;shopTokens:number;hpRatio:number;potions:number;cue:ReturnType<typeof openingBossPrepAssist>}[];
  for(const countdown of [14,12,8,2])for(const shopTokens of [0,1])for(const hpRatio of [1,.6])for(const potions of [0,1]){
    const cue=openingBossPrepAssist({elapsedSeconds:112,bossCountdown:countdown,shopTokens,hpRatio,potions}); samples.push({countdown,shopTokens,hpRatio,potions,cue});
  }
  const prepared=[
    {elapsedSeconds:112,bossCountdown:10,shopTokens:0,hpRatio:1,potions:1},
    {elapsedSeconds:112,bossCountdown:10,shopTokens:0,hpRatio:.6,potions:0},
    {elapsedSeconds:112,bossCountdown:6,shopTokens:0,hpRatio:.9,potions:0},
    {elapsedSeconds:112,bossCountdown:4,shopTokens:0,hpRatio:.8,potions:2},
  ];
  const preparedSilenceCoverage=prepared.filter(input=>openingBossPrepAssist(input)===null).length/prepared.length;
  const falsePositiveCount=samples.filter(sample=>(sample.countdown>12)&&sample.cue!==null).length;
  const maxConcurrentCues=samples.some(sample=>sample.cue)?1:0;
  const cueActions=[...new Set(samples.flatMap(sample=>sample.cue?[sample.cue.actionId]:[]))] as Extract<ActionId,'shop'|'potion'>[];
  const issues:string[]=[]; if(maxConcurrentCues>1)issues.push('prep-cue-density'); if(falsePositiveCount>0)issues.push('prep-early-false-positive'); if(preparedSilenceCoverage<1)issues.push('prepared-state-noise'); if(cueActions.length!==2)issues.push('prep-action-coverage');
  return{passed:issues.length===0,samples:samples.length+prepared.length,maxConcurrentCues,falsePositiveCount,preparedSilenceCoverage,cueActions,issues};
}
