import { openingCombatPacing } from './opening-pacing.js';
import { firstThirtyMinuteProfile } from './first-thirty-minute-director.js';

export interface OpeningThirtyTimetableSample{
  minute:number;
  spawnPressureMultiplier:number;
  eliteIntervalMultiplier:number;
  rewardMultiplier:number;
  shopIntervalMultiplier:number;
  enemyBudgetMultiplier:number;
}
export interface OpeningThirtyTimetableAudit{
  samples:OpeningThirtyTimetableSample[];
  maxSpawnDelta:number;
  maxEliteDelta:number;
  maxRewardDelta:number;
  noPressureCliff:boolean;
  rewardBounded:boolean;
  shopBudgetStable:boolean;
  passed:boolean;
}
function round(value:number):number{return Math.round(value*10000)/10000;}
export function openingThirtyMinuteSample(elapsedSeconds:number):OpeningThirtyTimetableSample{
  const seconds=Math.max(0,Math.min(1799.999,Number.isFinite(elapsedSeconds)?elapsedSeconds:0));
  const opening=openingCombatPacing(seconds);
  const extension=firstThirtyMinuteProfile(seconds);
  return{
    minute:Math.floor(seconds/60),
    spawnPressureMultiplier:round(opening.spawnPressureMultiplier*extension.spawnPressureMultiplier),
    eliteIntervalMultiplier:round(opening.eliteIntervalMultiplier*extension.eliteIntervalMultiplier),
    rewardMultiplier:round(opening.rewardMultiplier*extension.rewardMultiplier),
    shopIntervalMultiplier:opening.shopIntervalMultiplier*extension.shopIntervalMultiplier,
    enemyBudgetMultiplier:opening.enemyBudgetMultiplier*extension.enemyBudgetMultiplier,
  };
}
export function openingThirtyTimetableAudit():OpeningThirtyTimetableAudit{
  const samples=Array.from({length:30},(_,minute)=>openingThirtyMinuteSample(minute*60));
  let maxSpawnDelta=0,maxEliteDelta=0,maxRewardDelta=0;
  for(let i=1;i<samples.length;i++){
    const prev=samples[i-1]!,next=samples[i]!;
    maxSpawnDelta=Math.max(maxSpawnDelta,Math.abs(next.spawnPressureMultiplier-prev.spawnPressureMultiplier));
    maxEliteDelta=Math.max(maxEliteDelta,Math.abs(next.eliteIntervalMultiplier-prev.eliteIntervalMultiplier));
    maxRewardDelta=Math.max(maxRewardDelta,Math.abs(next.rewardMultiplier-prev.rewardMultiplier));
  }
  maxSpawnDelta=round(maxSpawnDelta);maxEliteDelta=round(maxEliteDelta);maxRewardDelta=round(maxRewardDelta);
  const noPressureCliff=maxSpawnDelta<=.04&&maxEliteDelta<=.06&&samples.slice(10).every((sample)=>sample.spawnPressureMultiplier>=1&&sample.eliteIntervalMultiplier<=1);
  const rewardBounded=maxRewardDelta<=.025&&samples.every((sample)=>sample.rewardMultiplier>=1&&sample.rewardMultiplier<=1.1);
  const shopBudgetStable=samples.every((sample)=>sample.shopIntervalMultiplier===1&&sample.enemyBudgetMultiplier===1);
  return{samples,maxSpawnDelta,maxEliteDelta,maxRewardDelta,noPressureCliff,rewardBounded,shopBudgetStable,passed:noPressureCliff&&rewardBounded&&shopBudgetStable};
}
