import { directorSnapshot } from '../domain/director.js';
import { enemyStats } from './enemies.js';
import { bossDifficultyCurve } from './boss-difficulty-curve.js';

export interface FirstSixBossCheckpoint{
  ordinal:number;
  spawnSecond:number;
  danger:number;
  healthMultiplier:number;
  damageMultiplier:number;
  specialTimerMultiplier:number;
  expectedDps:number;
  clearSeconds:number;
  normalizedDifficulty:number;
}
export interface FirstSixBossAudit{
  checkpoints:FirstSixBossCheckpoint[];
  maxClearTimeRatio:number;
  maxDifficultyRatio:number;
  clearTimesBounded:boolean;
  difficultySlopeBounded:boolean;
  lateNeutral:boolean;
  passed:boolean;
}
function round(value:number):number{return Math.round(value*1000)/1000;}
function expectedPlayerDps(seconds:number):number{return 90*Math.pow(1+Math.max(0,seconds)/300,.9);}
export function firstSixBossCheckpoints():FirstSixBossCheckpoint[]{
  const points:FirstSixBossCheckpoint[]=[];
  let spawnSecond=120;
  for(let ordinal=0;ordinal<6;ordinal++){
    const director=directorSnapshot(spawnSecond);
    const curve=bossDifficultyCurve(ordinal,spawnSecond,0);
    const base=enemyStats('boss',director.danger);
    const expectedDps=expectedPlayerDps(spawnSecond);
    const clearSeconds=base.hp*curve.healthMultiplier/expectedDps;
    const normalizedDifficulty=clearSeconds*(1+(director.danger-1)*.012)*curve.damageMultiplier/curve.initialSpecialTimerMultiplier;
    points.push({
      ordinal,
      spawnSecond:round(spawnSecond),
      danger:director.danger,
      healthMultiplier:curve.healthMultiplier,
      damageMultiplier:curve.damageMultiplier,
      specialTimerMultiplier:curve.initialSpecialTimerMultiplier,
      expectedDps:round(expectedDps),
      clearSeconds:round(clearSeconds),
      normalizedDifficulty:round(normalizedDifficulty),
    });
    spawnSecond+=director.bossInterval;
  }
  return points;
}
export function auditFirstSixBosses():FirstSixBossAudit{
  const checkpoints=firstSixBossCheckpoints();
  let maxClearTimeRatio=1,maxDifficultyRatio=1;
  for(let i=1;i<checkpoints.length;i++){
    maxClearTimeRatio=Math.max(maxClearTimeRatio,checkpoints[i]!.clearSeconds/Math.max(.001,checkpoints[i-1]!.clearSeconds));
    maxDifficultyRatio=Math.max(maxDifficultyRatio,checkpoints[i]!.normalizedDifficulty/Math.max(.001,checkpoints[i-1]!.normalizedDifficulty));
  }
  maxClearTimeRatio=round(maxClearTimeRatio);maxDifficultyRatio=round(maxDifficultyRatio);
  const clearTimesBounded=checkpoints.every((point)=>point.clearSeconds>=15&&point.clearSeconds<=60)&&maxClearTimeRatio<=1.35;
  const difficultySlopeBounded=maxDifficultyRatio<=1.5;
  const lateNeutral=checkpoints.slice(3).every((point)=>point.healthMultiplier===1&&point.damageMultiplier===1&&point.specialTimerMultiplier===1);
  return{checkpoints,maxClearTimeRatio,maxDifficultyRatio,clearTimesBounded,difficultySlopeBounded,lateNeutral,passed:clearTimesBounded&&difficultySlopeBounded&&lateNeutral};
}
