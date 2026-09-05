import { HERO_PROFILES, heroProfile, type HeroId } from './hero-profiles.js';
import { heroReleaseModel } from './hero-release-model.js';
import { heroThreatPressureIndex } from './hero-threat-release-audit.js';
import type { ThreatLevel } from '../domain/threat-level.js';

export interface HeroDamageShares { contact:number; projectile:number; arena:number; bossSpecial:number; }
export interface CoreDamageShares { contact:number; projectile:number; arena:number; bossSpecial:number; coreSiege:number; }
export interface HeroDamageDistributionSample {
  heroId:HeroId;
  threat:ThreatLevel;
  heroDamageShares:HeroDamageShares;
  coreDamageShares:CoreDamageShares;
  heroLossIndex:number;
  coreLossIndex:number;
}
export interface HeroDamageDistributionAudit {
  samples:HeroDamageDistributionSample[];
  maxHeroLossSpread:number;
  maxCoreLossSpread:number;
  sharesNormalized:boolean;
  sourceDominanceBounded:boolean;
  heroLossSpreadBounded:boolean;
  coreLossSpreadBounded:boolean;
  threatMonotonic:boolean;
  passed:boolean;
}
const THREATS=[0,3,5] as const satisfies readonly ThreatLevel[];
function round(value:number):number{return Math.round(value*10000)/10000;}
function normalize<T extends object>(raw:T):T{
  const entries=Object.entries(raw as Record<string,number>);
  const total=entries.reduce((sum,[,value])=>sum+value,0);
  return Object.fromEntries(entries.map(([key,value])=>[key,round(value/Math.max(.0001,total))])) as T;
}
function spread(values:readonly number[]):number{return round(Math.max(...values)/Math.max(.0001,Math.min(...values)));}

export function heroDamageDistributionSamples():HeroDamageDistributionSample[]{
  const samples:HeroDamageDistributionSample[]=[];
  for(const hero of HERO_PROFILES){
    const profile=heroProfile(hero.id);
    const model=heroReleaseModel(hero.id);
    const speed=Math.max(.7,profile.baseSpeed/285);
    const control=model.controlIndex;
    const heroRaw:HeroDamageShares={
      contact:.34/(Math.pow(speed,.70)*Math.pow(control,.25)),
      projectile:.27/(Math.pow(speed,.40)*Math.pow(control,.35)),
      arena:.18/(Math.pow(speed,.55)*Math.pow(control,.10)),
      bossSpecial:.21/Math.pow(control,.25),
    };
    const coreRaw:CoreDamageShares={
      contact:.20/Math.pow(control,.35),
      projectile:.15/Math.pow(control,.30),
      arena:.12/Math.pow(control,.15),
      bossSpecial:.23/Math.pow(control,.20),
      coreSiege:.30/Math.pow(model.coreGuardIndex,.35),
    };
    const heroExposure=Object.values(heroRaw).reduce((sum,value)=>sum+value,0)/Math.max(.5,model.survivalIndex);
    const coreExposure=Object.values(coreRaw).reduce((sum,value)=>sum+value,0)/Math.pow(Math.max(.5,model.coreGuardIndex),.45);
    for(const threat of THREATS){
      const pressure=heroThreatPressureIndex(30,threat);
      samples.push({
        heroId:hero.id,
        threat,
        heroDamageShares:normalize(heroRaw),
        coreDamageShares:normalize(coreRaw),
        heroLossIndex:round(pressure*heroExposure),
        coreLossIndex:round(pressure*coreExposure),
      });
    }
  }
  return samples;
}
export function auditHeroDamageDistribution():HeroDamageDistributionAudit{
  const samples=heroDamageDistributionSamples();
  let maxHeroLossSpread=1,maxCoreLossSpread=1;
  for(const threat of THREATS){
    const group=samples.filter((sample)=>sample.threat===threat);
    maxHeroLossSpread=Math.max(maxHeroLossSpread,spread(group.map((sample)=>sample.heroLossIndex)));
    maxCoreLossSpread=Math.max(maxCoreLossSpread,spread(group.map((sample)=>sample.coreLossIndex)));
  }
  maxHeroLossSpread=round(maxHeroLossSpread);maxCoreLossSpread=round(maxCoreLossSpread);
  const sharesNormalized=samples.every((sample)=>Math.abs(Object.values(sample.heroDamageShares).reduce((a,b)=>a+b,0)-1)<.002&&Math.abs(Object.values(sample.coreDamageShares).reduce((a,b)=>a+b,0)-1)<.002);
  const sourceDominanceBounded=samples.every((sample)=>Math.max(...Object.values(sample.heroDamageShares))<=.55&&Math.max(...Object.values(sample.coreDamageShares))<=.60);
  const heroLossSpreadBounded=maxHeroLossSpread<=1.55;
  const coreLossSpreadBounded=maxCoreLossSpread<=1.75;
  let threatMonotonic=true;
  for(const hero of HERO_PROFILES){
    const group=samples.filter((sample)=>sample.heroId===hero.id).sort((a,b)=>a.threat-b.threat);
    if(!(group[0]!.heroLossIndex<group[1]!.heroLossIndex&&group[1]!.heroLossIndex<group[2]!.heroLossIndex&&group[0]!.coreLossIndex<group[1]!.coreLossIndex&&group[1]!.coreLossIndex<group[2]!.coreLossIndex))threatMonotonic=false;
  }
  return{samples,maxHeroLossSpread,maxCoreLossSpread,sharesNormalized,sourceDominanceBounded,heroLossSpreadBounded,coreLossSpreadBounded,threatMonotonic,passed:sharesNormalized&&sourceDominanceBounded&&heroLossSpreadBounded&&coreLossSpreadBounded&&threatMonotonic};
}
