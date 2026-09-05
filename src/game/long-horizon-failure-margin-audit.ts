import { directorSnapshot } from '../domain/director.js';
import { threatLevelModifiers, type ThreatLevel } from '../domain/threat-level.js';
import { getAscensionModifiers, getAscensionTier } from './endless/ascension.js';
import { HERO_PROFILES, type HeroId } from './hero-profiles.js';
import { heroReleaseModel } from './hero-release-model.js';

export interface LongHorizonFailureMarginSample{
  heroId:HeroId;
  threat:ThreatLevel;
  minute:30|60|120;
  pressureIndex:number;
  adaptationIndex:number;
  heroReserveMargin:number;
  coreReserveMargin:number;
}
export interface LongHorizonFailureMarginAudit{
  samples:LongHorizonFailureMarginSample[];
  minHeroReserveMargin:number;
  minCoreReserveMargin:number;
  maxHeroSpread:number;
  maxCoreSpread:number;
  threatMonotonic:boolean;
  edricCoreLeader:boolean;
  passed:boolean;
}
const MINUTES=[30,60,120] as const;
const THREATS=[0,3,5] as const satisfies readonly ThreatLevel[];
function round(value:number):number{return Math.round(value*10000)/10000;}
function spread(values:readonly number[]):number{return round(Math.max(...values)/Math.max(.0001,Math.min(...values)));}
function pressureAt(minute:number,threat:ThreatLevel):number{
  const seconds=minute*60;
  const director=directorSnapshot(seconds);
  const threatMods=threatLevelModifiers(threat);
  const ascension=getAscensionModifiers(getAscensionTier(seconds*1000));
  const elitePressure=1+Math.max(0,1/Math.max(.4,threatMods.eliteIntervalMultiplier)-1)*.10;
  return round(director.damageMultiplier*Math.pow(director.hpMultiplier,.08)*threatMods.spawnPressureMultiplier*threatMods.enemySpeedMultiplier*elitePressure*ascension.enemyDamageMultiplier*Math.pow(ascension.spawnBudgetMultiplier,.24));
}
function adaptationAt(minute:number):number{
  const longRun=Math.max(0,Math.log2(Math.max(1,minute/30)));
  return round(1+longRun*.38);
}
export function longHorizonFailureMarginSamples():LongHorizonFailureMarginSample[]{
  const samples:LongHorizonFailureMarginSample[]=[];
  for(const hero of HERO_PROFILES){
    const model=heroReleaseModel(hero.id);
    for(const threat of THREATS)for(const minute of MINUTES){
      const pressureIndex=pressureAt(minute,threat);
      const adaptationIndex=adaptationAt(minute);
      samples.push({
        heroId:hero.id,threat,minute,pressureIndex,adaptationIndex,
        heroReserveMargin:round(model.survivalIndex*adaptationIndex*2.10/Math.pow(pressureIndex,.40)),
        coreReserveMargin:round(model.coreGuardIndex*Math.pow(adaptationIndex,.92)*2.04/Math.pow(pressureIndex,.37)),
      });
    }
  }
  return samples;
}
export function auditLongHorizonFailureMargin():LongHorizonFailureMarginAudit{
  const samples=longHorizonFailureMarginSamples();
  const minHeroReserveMargin=round(Math.min(...samples.map((sample)=>sample.heroReserveMargin)));
  const minCoreReserveMargin=round(Math.min(...samples.map((sample)=>sample.coreReserveMargin)));
  let maxHeroSpread=1,maxCoreSpread=1,threatMonotonic=true;
  for(const minute of MINUTES)for(const threat of THREATS){
    const group=samples.filter((sample)=>sample.minute===minute&&sample.threat===threat);
    maxHeroSpread=Math.max(maxHeroSpread,spread(group.map((sample)=>sample.heroReserveMargin)));
    maxCoreSpread=Math.max(maxCoreSpread,spread(group.map((sample)=>sample.coreReserveMargin)));
  }
  for(const hero of HERO_PROFILES)for(const minute of MINUTES){
    const group=samples.filter((sample)=>sample.heroId===hero.id&&sample.minute===minute).sort((a,b)=>a.threat-b.threat);
    if(!(group[0]!.heroReserveMargin>group[1]!.heroReserveMargin&&group[1]!.heroReserveMargin>group[2]!.heroReserveMargin&&group[0]!.coreReserveMargin>group[1]!.coreReserveMargin&&group[1]!.coreReserveMargin>group[2]!.coreReserveMargin))threatMonotonic=false;
  }
  maxHeroSpread=round(maxHeroSpread);maxCoreSpread=round(maxCoreSpread);
  const edricCoreLeader=MINUTES.every((minute)=>THREATS.every((threat)=>{
    const group=samples.filter((sample)=>sample.minute===minute&&sample.threat===threat);
    const edric=group.find((sample)=>sample.heroId==='edric')!;
    return edric.coreReserveMargin===Math.max(...group.map((sample)=>sample.coreReserveMargin));
  }));
  const passed=samples.length===36&&minHeroReserveMargin>=.62&&minCoreReserveMargin>=.62&&maxHeroSpread<=1.60&&maxCoreSpread<=1.85&&threatMonotonic&&edricCoreLeader;
  return{samples,minHeroReserveMargin,minCoreReserveMargin,maxHeroSpread,maxCoreSpread,threatMonotonic,edricCoreLeader,passed};
}
