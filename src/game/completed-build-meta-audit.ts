import type { ThreatLevel } from '../domain/threat-level.js';
import { overdriveModifiers, createDefaultOverdriveState, type BuildArchetype } from './endless/build-overdrive.js';
import { finalFormCatalog, finalFormModifiers, type HeroFinalFormId } from './endless/final-form.js';
import { HERO_PROFILES, type HeroId } from './hero-profiles.js';
import { heroReleaseModel } from './hero-release-model.js';
import { heroThreatPressureIndex } from './hero-threat-release-audit.js';
import { relicCandidates, relicModifiers, type RelicId } from './relics.js';
import { FUSION_IDS, fusionModifiers, type FusionId } from './spell-fusions.js';
import { bossArchetypeForOrdinal } from './boss-patterns.js';

export interface CompletedBuildMetaSample {
  heroId:HeroId;
  relicId:RelicId;
  fusionIds:readonly [FusionId,FusionId];
  finalFormId:HeroFinalFormId;
  archetype:BuildArchetype;
  threat:ThreatLevel;
  offenseIndex:number;
  survivalIndex:number;
  coreGuardIndex:number;
  economyIndex:number;
  areaIndex:number;
  tempoIndex:number;
  bossDamageIndex:number;
  compositeIndex:number;
  pressureIndex:number;
  releaseMargin:number;
}
export interface CompletedBuildMetaAudit {
  samples:CompletedBuildMetaSample[];
  maxHeroTopSpread:number;
  maxWithinHeroSpread:number;
  minThreatFiveMargin:number;
  maxThreatZeroMargin:number;
  threatMonotonic:boolean;
  trapCount:number;
  passed:boolean;
}

const THREATS=[0,3,5] as const satisfies readonly ThreatLevel[];
const ARCHETYPES=['burst','cycle','domain','fortress'] as const satisfies readonly BuildArchetype[];
function round(value:number):number{return Math.round(value*10000)/10000;}
function spread(values:readonly number[]):number{return round(Math.max(...values)/Math.max(.0001,Math.min(...values)));}
function clamp(value:number,min:number,max:number):number{return Math.max(min,Math.min(max,value));}

function legalRelics(heroId:HeroId):RelicId[]{
  const ids=new Set<RelicId>();
  for(let ordinal=0;ordinal<6;ordinal+=1){
    for(const id of relicCandidates(heroId,null,()=>0,bossArchetypeForOrdinal(ordinal),15))ids.add(id);
  }
  return [...ids].sort();
}
function fusionPairs():readonly (readonly [FusionId,FusionId])[]{
  const pairs:Array<readonly [FusionId,FusionId]>=[];
  for(let i=0;i<FUSION_IDS.length;i+=1)for(let j=i+1;j<FUSION_IDS.length;j+=1)pairs.push([FUSION_IDS[i]!,FUSION_IDS[j]!]);
  return pairs;
}
function pairProfile(ids:readonly [FusionId,FusionId],heroId:HeroId):{power:number;area:number;cooldown:number;utility:number}{
  const a=fusionModifiers(ids[0],heroId),b=fusionModifiers(ids[1],heroId);
  const utility=1+(a.jumpBonus+b.jumpBonus)*.018+(a.pierceBonus+b.pierceBonus)*.022+Math.max(0,a.slowDurationMultiplier-1)*.08+Math.max(0,b.slowDurationMultiplier-1)*.08+Math.max(0,a.tickMultiplier-1)*.10+Math.max(0,b.tickMultiplier-1)*.10;
  return{
    power:Math.sqrt(a.damageMultiplier*b.damageMultiplier)*Math.pow(a.tickMultiplier*b.tickMultiplier,.10),
    area:Math.sqrt(a.areaMultiplier*b.areaMultiplier),
    cooldown:Math.sqrt(a.cooldownMultiplier*b.cooldownMultiplier),
    utility,
  };
}
function archetypeProfile(archetype:BuildArchetype):{spell:number;cooldown:number;area:number;heroTaken:number;coreTaken:number;boss:number;fusion:number}{
  const mods=overdriveModifiers({...createDefaultOverdriveState(),activeUntilMs:1},archetype,0);
  return{spell:mods.spellPowerMultiplier,cooldown:mods.cooldownMultiplier,area:mods.areaMultiplier,heroTaken:mods.heroDamageTakenMultiplier,coreTaken:mods.coreDamageTakenMultiplier,boss:mods.bossDamageMultiplier,fusion:mods.fusionPowerMultiplier};
}
function identityRelicOffense(heroId:HeroId,relicId:RelicId):number{
  const relic=relicModifiers(relicId,heroId);
  let value=1;
  if(heroId==='arkan')value*=1+relic.arkanExplosionChanceBonus*.28+Math.max(0,relic.arkanExplosionRadiusMultiplier-1)*.08;
  if(heroId==='kain')value*=1+Math.max(0,relic.kainOverloadGainMultiplier-1)*.10+Math.max(0,relic.kainOverloadMaxCooldownReduction-.20)*.40;
  if(heroId==='edric')value*=1+Math.max(0,relic.edricAuraRadiusBonus)/1000;
  return value;
}

export function completedBuildMetaSamples():CompletedBuildMetaSample[]{
  const samples:CompletedBuildMetaSample[]=[];
  const pairs=fusionPairs();
  for(const hero of HERO_PROFILES){
    const base=heroReleaseModel(hero.id);
    for(const relicId of legalRelics(hero.id)){
      const relic=relicModifiers(relicId,hero.id);
      const relicIdentity=identityRelicOffense(hero.id,relicId);
      for(const fusionIds of pairs){
        const fusion=pairProfile(fusionIds,hero.id);
        for(const form of finalFormCatalog(hero.id)){
          const final=finalFormModifiers(form);
          for(const archetype of ARCHETYPES){
            const overdrive=archetypeProfile(archetype);
            const tempoIndex=1/Math.max(.55,relic.cooldownMultiplier*fusion.cooldown*final.cooldownMultiplier*overdrive.cooldown);
            const areaIndex=relic.areaMultiplier*fusion.area*final.areaMultiplier*overdrive.area;
            const bossDamageIndex=final.bossDamageMultiplier*overdrive.boss;
            const fusionPower=fusion.power*fusion.utility*final.fusionPowerMultiplier*overdrive.fusion;
            const offense=base.offenseIndex*relic.spellPowerMultiplier*final.spellPowerMultiplier*overdrive.spell*Math.pow(tempoIndex,.62)*Math.pow(areaIndex,.10)*Math.pow(bossDamageIndex,.08)*Math.pow(fusionPower,.38)*relicIdentity;
            const survival=base.survivalIndex*Math.pow(relic.moveSpeedMultiplier*final.moveSpeedMultiplier,.18)/Math.max(.55,relic.heroDamageTakenMultiplier*final.heroDamageTakenMultiplier*overdrive.heroTaken);
            let core=base.coreGuardIndex/Math.max(.50,relic.coreDamageTakenMultiplier*final.coreDamageTakenMultiplier*overdrive.coreTaken);
            if(hero.id==='edric')core*=1+Math.max(0,relic.edricAuraRadiusBonus)/900+Math.max(0,.78-relic.edricCoreAuraMultiplier)*.35;
            const economy=relic.goldMultiplier;
            const composite=Math.pow(offense,.45)*Math.pow(survival,.25)*Math.pow(core,.22)*Math.pow(economy,.08);
            for(const threat of THREATS){
              const pressure=heroThreatPressureIndex(120,threat);
              const margin=composite*1.36/Math.pow(pressure,.45);
              samples.push({heroId:hero.id,relicId,fusionIds,finalFormId:form.id,archetype,threat,offenseIndex:round(offense),survivalIndex:round(survival),coreGuardIndex:round(core),economyIndex:round(economy),areaIndex:round(areaIndex),tempoIndex:round(tempoIndex),bossDamageIndex:round(bossDamageIndex),compositeIndex:round(composite),pressureIndex:round(pressure),releaseMargin:round(margin)});
            }
          }
        }
      }
    }
  }
  return samples;
}

export function auditCompletedBuildMeta():CompletedBuildMetaAudit{
  const samples=completedBuildMetaSamples();
  let maxHeroTopSpread=1,maxWithinHeroSpread=1,threatMonotonic=true;
  for(const threat of THREATS)for(const archetype of ARCHETYPES){
    const heroTops=HERO_PROFILES.map((hero)=>Math.max(...samples.filter((sample)=>sample.heroId===hero.id&&sample.threat===threat&&sample.archetype===archetype).map((sample)=>sample.compositeIndex)));
    maxHeroTopSpread=Math.max(maxHeroTopSpread,spread(heroTops));
  }
  for(const hero of HERO_PROFILES)for(const threat of THREATS){
    const values=samples.filter((sample)=>sample.heroId===hero.id&&sample.threat===threat).map((sample)=>sample.compositeIndex);
    maxWithinHeroSpread=Math.max(maxWithinHeroSpread,spread(values));
  }
  const keyed=new Map<string,CompletedBuildMetaSample[]>();
  for(const sample of samples){
    const key=[sample.heroId,sample.relicId,sample.fusionIds.join('+'),sample.finalFormId,sample.archetype].join('|');
    const group=keyed.get(key)??[];group.push(sample);keyed.set(key,group);
  }
  for(const group of keyed.values()){
    group.sort((a,b)=>a.threat-b.threat);
    if(group.length!==3||!(group[0]!.releaseMargin>group[1]!.releaseMargin&&group[1]!.releaseMargin>group[2]!.releaseMargin))threatMonotonic=false;
  }
  maxHeroTopSpread=round(maxHeroTopSpread);maxWithinHeroSpread=round(maxWithinHeroSpread);
  const t5=samples.filter((sample)=>sample.threat===5),t0=samples.filter((sample)=>sample.threat===0);
  const minThreatFiveMargin=round(Math.min(...t5.map((sample)=>sample.releaseMargin)));
  const maxThreatZeroMargin=round(Math.max(...t0.map((sample)=>sample.releaseMargin)));
  const trapCount=t5.filter((sample)=>sample.releaseMargin<.62).length;
  const passed=samples.length===17280&&maxHeroTopSpread<=1.35&&maxWithinHeroSpread<=2.10&&minThreatFiveMargin>=.62&&maxThreatZeroMargin<=3.25&&threatMonotonic&&trapCount===0;
  return{samples,maxHeroTopSpread,maxWithinHeroSpread,minThreatFiveMargin,maxThreatZeroMargin,threatMonotonic,trapCount,passed};
}
