import { openingCombatPacing } from './opening-pacing.js';

export type FirstThirtyMinuteBand='neutral'|'settle'|'build_test'|'boss_ready';
export interface FirstThirtyMinuteProfile{
  band:FirstThirtyMinuteBand;
  spawnPressureMultiplier:number;
  eliteIntervalMultiplier:number;
  rewardMultiplier:number;
  shopIntervalMultiplier:1;
  enemyBudgetMultiplier:1;
}
export interface FirstThirtyMinuteAuditCheckpoint{
  minute:number;
  spawnPressureMultiplier:number;
  eliteIntervalMultiplier:number;
  rewardMultiplier:number;
  shopIntervalMultiplier:number;
  enemyBudgetMultiplier:number;
}
export interface FirstThirtyMinuteAudit{
  checkpoints:FirstThirtyMinuteAuditCheckpoint[];
  noPressureCliff:boolean;
  rewardBounded:boolean;
  shopBudgetStable:boolean;
  passed:boolean;
}

const NEUTRAL:FirstThirtyMinuteProfile={band:'neutral',spawnPressureMultiplier:1,eliteIntervalMultiplier:1,rewardMultiplier:1,shopIntervalMultiplier:1,enemyBudgetMultiplier:1};
function lerp(a:number,b:number,t:number):number{return a+(b-a)*Math.max(0,Math.min(1,t));}
function round(value:number):number{return Math.round(value*10000)/10000;}
function profile(band:FirstThirtyMinuteBand,s:number,start:number,end:number,from:[number,number,number],to:[number,number,number]):FirstThirtyMinuteProfile{
  const t=(s-start)/Math.max(1,end-start);
  return{band,spawnPressureMultiplier:round(lerp(from[0],to[0],t)),eliteIntervalMultiplier:round(lerp(from[1],to[1],t)),rewardMultiplier:round(lerp(from[2],to[2],t)),shopIntervalMultiplier:1,enemyBudgetMultiplier:1};
}

export function firstThirtyMinuteProfile(elapsedSeconds:number):FirstThirtyMinuteProfile{
  const s=Math.max(0,Number.isFinite(elapsedSeconds)?elapsedSeconds:0);
  if(s<600||s>=1800)return{...NEUTRAL};
  if(s<900)return profile('settle',s,600,900,[1.012,.994,1.006],[1.024,.98,1.014]);
  if(s<1320)return profile('build_test',s,900,1320,[1.024,.98,1.014],[1.036,.96,1.022]);
  return profile('boss_ready',s,1320,1800,[1.036,.96,1.022],[1.04,.94,1.03]);
}

export function auditFirstThirtyMinutes():FirstThirtyMinuteAudit{
  const minutes=[2,5,10,15,20,30] as const;
  const checkpoints=minutes.map((minute):FirstThirtyMinuteAuditCheckpoint=>{
    const seconds=minute*60;
    const opening=openingCombatPacing(seconds);
    const extension=firstThirtyMinuteProfile(seconds);
    return{
      minute,
      spawnPressureMultiplier:opening.spawnPressureMultiplier*extension.spawnPressureMultiplier,
      eliteIntervalMultiplier:opening.eliteIntervalMultiplier*extension.eliteIntervalMultiplier,
      rewardMultiplier:opening.rewardMultiplier*extension.rewardMultiplier,
      shopIntervalMultiplier:opening.shopIntervalMultiplier*extension.shopIntervalMultiplier,
      enemyBudgetMultiplier:opening.enemyBudgetMultiplier*extension.enemyBudgetMultiplier,
    };
  });
  const postOpening=checkpoints.filter((point)=>point.minute>=10&&point.minute<30);
  const noPressureCliff=postOpening.every((point)=>point.spawnPressureMultiplier>=1&&point.eliteIntervalMultiplier<=1);
  const rewardBounded=checkpoints.every((point)=>point.rewardMultiplier>=1&&point.rewardMultiplier<=1.1);
  const shopBudgetStable=checkpoints.every((point)=>point.shopIntervalMultiplier===1&&point.enemyBudgetMultiplier===1);
  return{checkpoints,noPressureCliff,rewardBounded,shopBudgetStable,passed:noPressureCliff&&rewardBounded&&shopBudgetStable};
}
