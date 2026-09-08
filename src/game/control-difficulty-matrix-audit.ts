import { threatLevelModifiers, type ThreatLevel } from '../domain/threat-level.js';
import { HERO_PROFILES, type HeroId } from './hero-profiles.js';
import { heroReleaseModel } from './hero-release-model.js';

export type ControlSkillBand='average-manual'|'auto'|'skilled-manual';
export interface ControlDifficultySample{heroId:HeroId;threat:ThreatLevel;control:ControlSkillBand;pressureIndex:number;controlEfficiency:number;effectiveMargin:number;}
export interface ControlDifficultyMatrixAudit{passed:boolean;samples:ControlDifficultySample[];averageManualEfficiency:number;autoEfficiency:number;skilledManualEfficiency:number;pressureMonotonic:boolean;controlOrderingPassed:boolean;threatTwoBaseline:boolean;autoStatCoupling:false;issues:string[];}
export const CONTROL_EFFICIENCY={averageManual:.86,auto:.90,skilledManual:1.00} as const;
function round(v:number):number{return Math.round(v*10000)/10000;}
export function controlThreatPressureIndex(threat:ThreatLevel):number{
  const m=threatLevelModifiers(threat);
  const elite=Math.pow(1/Math.max(.5,m.eliteIntervalMultiplier),.20);
  const projectile=Math.pow(m.projectileSpeedMultiplier,.24);
  const bossCadence=Math.pow(1/Math.max(.62,m.bossSpecialCadenceMultiplier),.12);
  return round(m.spawnPressureMultiplier*Math.pow(m.enemySpeedMultiplier,.45)*elite*projectile*bossCadence);
}
export function auditControlDifficultyMatrix():ControlDifficultyMatrixAudit{
  const bands:[ControlSkillBand,number][]=[['average-manual',CONTROL_EFFICIENCY.averageManual],['auto',CONTROL_EFFICIENCY.auto],['skilled-manual',CONTROL_EFFICIENCY.skilledManual]];
  const samples:ControlDifficultySample[]=[];
  for(const hero of HERO_PROFILES){const model=heroReleaseModel(hero.id);for(let t=0;t<=5;t++){const threat=t as ThreatLevel,pressure=controlThreatPressureIndex(threat);for(const [control,eff] of bands)samples.push({heroId:hero.id,threat,control,pressureIndex:pressure,controlEfficiency:eff,effectiveMargin:round(model.compositeIndex*eff/Math.pow(pressure,.42))});}}
  const pressures=Array.from({length:6},(_,i)=>controlThreatPressureIndex(i as ThreatLevel));
  const pressureMonotonic=pressures.every((value,index)=>index===0||value>pressures[index-1]!);
  const controlOrderingPassed=HERO_PROFILES.every((hero)=>Array.from({length:6},(_,i)=>i as ThreatLevel).every((threat)=>{const g=samples.filter((s)=>s.heroId===hero.id&&s.threat===threat);const avg=g.find((s)=>s.control==='average-manual')!,auto=g.find((s)=>s.control==='auto')!,skilled=g.find((s)=>s.control==='skilled-manual')!;return avg.effectiveMargin<auto.effectiveMargin&&auto.effectiveMargin<skilled.effectiveMargin;}));
  const threatTwoBaseline=Math.abs(controlThreatPressureIndex(2)-1)<=.0001;
  const issues:string[]=[];
  if(samples.length!==72)issues.push('matrix-size');
  if(!pressureMonotonic)issues.push('threat-pressure-monotonic');
  if(!controlOrderingPassed)issues.push('control-ordering');
  if(!threatTwoBaseline)issues.push('threat-two-baseline');
  if(CONTROL_EFFICIENCY.auto<.88||CONTROL_EFFICIENCY.auto>.92)issues.push('auto-efficiency-band');
  return{passed:issues.length===0,samples,averageManualEfficiency:CONTROL_EFFICIENCY.averageManual,autoEfficiency:CONTROL_EFFICIENCY.auto,skilledManualEfficiency:CONTROL_EFFICIENCY.skilledManual,pressureMonotonic,controlOrderingPassed,threatTwoBaseline,autoStatCoupling:false,issues};
}
