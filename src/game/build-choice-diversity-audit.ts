import type { ThreatLevel } from '../domain/threat-level.js';
import { completedBuildMetaSamples, type CompletedBuildMetaSample } from './completed-build-meta-audit.js';
import { HERO_PROFILES, type HeroId } from './hero-profiles.js';

export interface BuildChoiceDiversitySample { heroId:HeroId;threat:ThreatLevel;minute:30|60|120;topBuildCount:number;uniqueRelics:number;uniqueFusionPairs:number;uniqueFinalForms:number;uniqueArchetypes:number;relicConcentration:number;fusionPairConcentration:number;finalFormConcentration:number;archetypeConcentration:number; }
export interface BuildChoiceDiversityAudit { samples:BuildChoiceDiversitySample[];maxRelicConcentration:number;maxFusionPairConcentration:number;maxFinalFormConcentration:number;maxArchetypeConcentration:number;fixationCount:number;passed:boolean; }
const MINUTES=[30,60,120] as const;
const THREATS=[0,3,5] as const satisfies readonly ThreatLevel[];
function round(value:number):number{return Math.round(value*1000)/1000;}
function concentration<T>(values:readonly T[]):number{
  const counts=new Map<T,number>();for(const value of values)counts.set(value,(counts.get(value)??0)+1);
  return round(Math.max(...counts.values())/Math.max(1,values.length));
}
function diversityScore(sample:CompletedBuildMetaSample,minute:number):number{
  const economyWeight=minute===30?.08:minute===60?.04:.01;
  const survivalWeight=minute===30?.05:minute===60?.03:.01;
  return sample.compositeIndex*Math.pow(sample.economyIndex,economyWeight)*Math.pow(sample.survivalIndex,survivalWeight);
}
export function buildChoiceDiversitySamples():BuildChoiceDiversitySample[]{
  const builds=completedBuildMetaSamples();
  const samples:BuildChoiceDiversitySample[]=[];
  for(const hero of HERO_PROFILES)for(const threat of THREATS)for(const minute of MINUTES){
    const group=builds.filter((sample)=>sample.heroId===hero.id&&sample.threat===threat).map((sample)=>({sample,score:diversityScore(sample,minute)})).sort((a,b)=>b.score-a.score);
    const best=group[0]!.score;
    const threshold=minute===30?.88:minute===60?.90:.92;
    let top=group.filter((entry)=>entry.score>=best*threshold).map((entry)=>entry.sample);
    if(top.length<24)top=group.slice(0,24).map((entry)=>entry.sample);
    const fusionPairs=top.map((entry)=>[...entry.fusionIds].sort().join('+'));
    samples.push({
      heroId:hero.id,threat,minute,topBuildCount:top.length,
      uniqueRelics:new Set(top.map((entry)=>entry.relicId)).size,
      uniqueFusionPairs:new Set(fusionPairs).size,
      uniqueFinalForms:new Set(top.map((entry)=>entry.finalFormId)).size,
      uniqueArchetypes:new Set(top.map((entry)=>entry.archetype)).size,
      relicConcentration:concentration(top.map((entry)=>entry.relicId)),
      fusionPairConcentration:concentration(fusionPairs),
      finalFormConcentration:concentration(top.map((entry)=>entry.finalFormId)),
      archetypeConcentration:concentration(top.map((entry)=>entry.archetype)),
    });
  }
  return samples;
}
export function auditBuildChoiceDiversity():BuildChoiceDiversityAudit{
  const samples=buildChoiceDiversitySamples();
  const maxRelicConcentration=round(Math.max(...samples.map((sample)=>sample.relicConcentration)));
  const maxFusionPairConcentration=round(Math.max(...samples.map((sample)=>sample.fusionPairConcentration)));
  const maxFinalFormConcentration=round(Math.max(...samples.map((sample)=>sample.finalFormConcentration)));
  const maxArchetypeConcentration=round(Math.max(...samples.map((sample)=>sample.archetypeConcentration)));
  const fixationCount=samples.filter((sample)=>sample.uniqueRelics<3||sample.uniqueFusionPairs<4||sample.uniqueFinalForms<2||sample.uniqueArchetypes<2||sample.relicConcentration>.75||sample.fusionPairConcentration>.65||sample.finalFormConcentration>.75||sample.archetypeConcentration>.75).length;
  const passed=samples.length===36&&fixationCount===0&&maxRelicConcentration<=.75&&maxFusionPairConcentration<=.65&&maxFinalFormConcentration<=.75&&maxArchetypeConcentration<=.75;
  return{samples,maxRelicConcentration,maxFusionPairConcentration,maxFinalFormConcentration,maxArchetypeConcentration,fixationCount,passed};
}
