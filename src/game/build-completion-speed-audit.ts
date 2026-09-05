import type { ThreatLevel } from '../domain/threat-level.js';
import { projectBalanceAt } from './balance-simulator.js';
import type { BuildArchetype } from './endless/build-overdrive.js';
import { HERO_PROFILES, type HeroId } from './hero-profiles.js';
import { allHeroReleaseModels, heroReleaseModel } from './hero-release-model.js';

export interface BuildCompletionSpeedSample{
  heroId:HeroId;
  archetype:BuildArchetype;
  threat:ThreatLevel;
  minute:number;
  estimatedLevel:number;
  focusedPickEstimate:number;
  completionProgress:number;
}
export interface BuildCompletionCombination{
  heroId:HeroId;
  archetype:BuildArchetype;
  threat:ThreatLevel;
  completionMinute:number;
}
export interface BuildCompletionSpeedAudit{
  samples:BuildCompletionSpeedSample[];
  combinations:BuildCompletionCombination[];
  minCompletionMinute:number;
  maxCompletionMinute:number;
  maxHeroCompletionSpread:number;
  threatParity:boolean;
  passed:boolean;
}
const MINUTES=[10,15,20,25,30,40,50,60] as const;
const THREATS=[0,3,5] as const satisfies readonly ThreatLevel[];
const ARCHETYPES=['burst','cycle','domain','fortress'] as const satisfies readonly BuildArchetype[];
const FOCUS:Record<BuildArchetype,number>={burst:.56,cycle:.60,domain:.58,fortress:.55};
const TARGET_PICKS:Record<BuildArchetype,number>={burst:29.5,cycle:30,domain:29.5,fortress:28.5};
function round(value:number):number{return Math.round(value*1000)/1000;}
function clamp(value:number,min:number,max:number):number{return Math.max(min,Math.min(max,value));}
function roleAffinity(heroId:HeroId,archetype:BuildArchetype):number{
  const model=heroReleaseModel(heroId);
  const models=allHeroReleaseModels();
  const avg=(fn:(id:HeroId)=>number)=>models.reduce((sum,entry)=>sum+fn(entry.heroId),0)/models.length;
  let raw=1;
  if(archetype==='burst')raw=model.offenseIndex/avg((id)=>heroReleaseModel(id).offenseIndex);
  else if(archetype==='cycle')raw=Math.sqrt(model.offenseIndex*model.controlIndex)/avg((id)=>{const m=heroReleaseModel(id);return Math.sqrt(m.offenseIndex*m.controlIndex);});
  else if(archetype==='domain')raw=model.controlIndex/avg((id)=>heroReleaseModel(id).controlIndex);
  else raw=Math.sqrt(model.survivalIndex*model.coreGuardIndex)/avg((id)=>{const m=heroReleaseModel(id);return Math.sqrt(m.survivalIndex*m.coreGuardIndex);});
  return clamp(Math.pow(raw,.18),.94,1.06);
}
export function buildCompletionSpeedSamples():BuildCompletionSpeedSample[]{
  const samples:BuildCompletionSpeedSample[]=[];
  for(const hero of HERO_PROFILES)for(const archetype of ARCHETYPES)for(const threat of THREATS){
    const efficiency=FOCUS[archetype]*roleAffinity(hero.id,archetype);
    for(const minute of MINUTES){
      const estimatedLevel=projectBalanceAt(minute*60,threat).estimatedLevel;
      const focusedPickEstimate=Math.max(0,(estimatedLevel-1)*efficiency);
      samples.push({heroId:hero.id,archetype,threat,minute,estimatedLevel,focusedPickEstimate:round(focusedPickEstimate),completionProgress:round(Math.min(1,focusedPickEstimate/TARGET_PICKS[archetype]))});
    }
  }
  return samples;
}
export function auditBuildCompletionSpeed():BuildCompletionSpeedAudit{
  const samples=buildCompletionSpeedSamples();
  const combinations:BuildCompletionCombination[]=[];
  for(const hero of HERO_PROFILES)for(const archetype of ARCHETYPES)for(const threat of THREATS){
    const group=samples.filter((sample)=>sample.heroId===hero.id&&sample.archetype===archetype&&sample.threat===threat).sort((a,b)=>a.minute-b.minute);
    combinations.push({heroId:hero.id,archetype,threat,completionMinute:group.find((sample)=>sample.completionProgress>=1)?.minute??60});
  }
  const completion=combinations.map((entry)=>entry.completionMinute);
  const minCompletionMinute=Math.min(...completion),maxCompletionMinute=Math.max(...completion);
  let maxHeroCompletionSpread=1;
  for(const archetype of ARCHETYPES)for(const threat of THREATS){
    const values=combinations.filter((entry)=>entry.archetype===archetype&&entry.threat===threat).map((entry)=>entry.completionMinute);
    maxHeroCompletionSpread=Math.max(maxHeroCompletionSpread,Math.max(...values)/Math.max(1,Math.min(...values)));
  }
  maxHeroCompletionSpread=round(maxHeroCompletionSpread);
  const threatParity=HERO_PROFILES.every((hero)=>ARCHETYPES.every((archetype)=>new Set(combinations.filter((entry)=>entry.heroId===hero.id&&entry.archetype===archetype).map((entry)=>entry.completionMinute)).size===1));
  const passed=combinations.length===48&&minCompletionMinute>=15&&maxCompletionMinute<=30&&maxHeroCompletionSpread<=1.35&&threatParity;
  return{samples,combinations,minCompletionMinute,maxCompletionMinute,maxHeroCompletionSpread,threatParity,passed};
}
