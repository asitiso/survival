import type { ThreatLevel } from '../domain/threat-level.js';
import { completedBuildMetaSamples, type CompletedBuildMetaSample } from './completed-build-meta-audit.js';
import { HERO_PROFILES, type HeroId } from './hero-profiles.js';

export interface LongRunMetaDriftSample{
  heroId:HeroId;
  threat:ThreatLevel;
  hours:2|4|8|12;
  topBuildCount:number;
  uniqueRelics:number;
  uniqueFusionPairs:number;
  uniqueFinalForms:number;
  uniqueArchetypes:number;
  relicConcentration:number;
  fusionPairConcentration:number;
  finalFormConcentration:number;
  archetypeConcentration:number;
  buildKeys:string[];
}
export interface LongRunMetaDriftAudit{
  samples:LongRunMetaDriftSample[];
  maxConcentrationDelta:number;
  minTwoToTwelveOverlap:number;
  maxRelicConcentration:number;
  maxFusionPairConcentration:number;
  maxFinalFormConcentration:number;
  maxArchetypeConcentration:number;
  fixationCount:number;
  passed:boolean;
}
const HOURS=[2,4,8,12] as const;
const THREATS=[0,3,5] as const satisfies readonly ThreatLevel[];
function round(value:number):number{return Math.round(value*1000)/1000;}
function key(sample:CompletedBuildMetaSample):string{return [sample.relicId,[...sample.fusionIds].sort().join('+'),sample.finalFormId,sample.archetype].join('|');}
function concentration<T>(values:readonly T[]):number{const counts=new Map<T,number>();for(const value of values)counts.set(value,(counts.get(value)??0)+1);return round(Math.max(...counts.values())/Math.max(1,values.length));}
function score(sample:CompletedBuildMetaSample,hours:number):number{
  const t=(hours-2)/10;
  const survivalWeight=.04+.015*t;
  const coreWeight=.02+.01*t;
  const economyWeight=.04-.005*t;
  const tempoWeight=.035-.005*t;
  return sample.compositeIndex*Math.pow(sample.survivalIndex,survivalWeight)*Math.pow(sample.coreGuardIndex,coreWeight)*Math.pow(sample.economyIndex,economyWeight)*Math.pow(sample.tempoIndex,tempoWeight);
}
function topBuilds(group:CompletedBuildMetaSample[],hours:number):CompletedBuildMetaSample[]{
  const ranked=group.map((sample)=>({sample,score:score(sample,hours)})).sort((a,b)=>b.score-a.score);
  const best=ranked[0]!.score;
  const threshold=.90;
  let top=ranked.filter((entry)=>entry.score>=best*threshold).map((entry)=>entry.sample);
  if(top.length<24)top=ranked.slice(0,24).map((entry)=>entry.sample);
  return top;
}
export function longRunMetaDriftSamples():LongRunMetaDriftSample[]{
  const builds=completedBuildMetaSamples();
  const samples:LongRunMetaDriftSample[]=[];
  for(const hero of HERO_PROFILES)for(const threat of THREATS)for(const hours of HOURS){
    const group=builds.filter((sample)=>sample.heroId===hero.id&&sample.threat===threat);
    const top=topBuilds(group,hours);
    const fusionPairs=top.map((sample)=>[...sample.fusionIds].sort().join('+'));
    samples.push({heroId:hero.id,threat,hours,topBuildCount:top.length,uniqueRelics:new Set(top.map((sample)=>sample.relicId)).size,uniqueFusionPairs:new Set(fusionPairs).size,uniqueFinalForms:new Set(top.map((sample)=>sample.finalFormId)).size,uniqueArchetypes:new Set(top.map((sample)=>sample.archetype)).size,relicConcentration:concentration(top.map((sample)=>sample.relicId)),fusionPairConcentration:concentration(fusionPairs),finalFormConcentration:concentration(top.map((sample)=>sample.finalFormId)),archetypeConcentration:concentration(top.map((sample)=>sample.archetype)),buildKeys:top.map(key)});
  }
  return samples;
}
export function auditLongRunMetaDrift():LongRunMetaDriftAudit{
  const samples=longRunMetaDriftSamples();
  let maxConcentrationDelta=0,minTwoToTwelveOverlap=1;
  for(const hero of HERO_PROFILES)for(const threat of THREATS){
    const first=samples.find((sample)=>sample.heroId===hero.id&&sample.threat===threat&&sample.hours===2)!;
    const last=samples.find((sample)=>sample.heroId===hero.id&&sample.threat===threat&&sample.hours===12)!;
    for(const field of ['relicConcentration','fusionPairConcentration','finalFormConcentration','archetypeConcentration'] as const)maxConcentrationDelta=Math.max(maxConcentrationDelta,Math.abs(first[field]-last[field]));
    const firstSet=new Set(first.buildKeys),lastSet=new Set(last.buildKeys);
    const overlap=[...firstSet].filter((id)=>lastSet.has(id)).length/Math.max(1,Math.min(firstSet.size,lastSet.size));
    minTwoToTwelveOverlap=Math.min(minTwoToTwelveOverlap,overlap);
  }
  maxConcentrationDelta=round(maxConcentrationDelta);minTwoToTwelveOverlap=round(minTwoToTwelveOverlap);
  const maxRelicConcentration=round(Math.max(...samples.map((sample)=>sample.relicConcentration)));
  const maxFusionPairConcentration=round(Math.max(...samples.map((sample)=>sample.fusionPairConcentration)));
  const maxFinalFormConcentration=round(Math.max(...samples.map((sample)=>sample.finalFormConcentration)));
  const maxArchetypeConcentration=round(Math.max(...samples.map((sample)=>sample.archetypeConcentration)));
  const fixationCount=samples.filter((sample)=>sample.uniqueRelics<3||sample.uniqueFusionPairs<4||sample.uniqueFinalForms<2||sample.uniqueArchetypes<2||sample.relicConcentration>.75||sample.fusionPairConcentration>.65||sample.finalFormConcentration>.75||sample.archetypeConcentration>.75).length;
  const passed=samples.length===48&&maxConcentrationDelta<=.20&&minTwoToTwelveOverlap>=.35&&maxRelicConcentration<=.75&&maxFusionPairConcentration<=.65&&maxFinalFormConcentration<=.75&&maxArchetypeConcentration<=.75&&fixationCount===0;
  return{samples,maxConcentrationDelta,minTwoToTwelveOverlap,maxRelicConcentration,maxFusionPairConcentration,maxFinalFormConcentration,maxArchetypeConcentration,fixationCount,passed};
}
