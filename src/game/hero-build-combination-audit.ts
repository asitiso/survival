import type { ThreatLevel } from '../domain/threat-level.js';
import { overdriveModifiers, createDefaultOverdriveState, type BuildArchetype } from './endless/build-overdrive.js';
import { HERO_PROFILES, type HeroId } from './hero-profiles.js';
import { heroReleaseModel } from './hero-release-model.js';
import { heroThreatPressureIndex } from './hero-threat-release-audit.js';
import { masteryTraitId } from './mastery-unlocks.js';
import { RUN_TRAITS, runTraitBonuses, type RunTraitId } from './run-traits.js';

export interface HeroBuildCombinationCheckpoint {
  heroId:HeroId;
  traitId:RunTraitId;
  archetype:BuildArchetype;
  threat:ThreatLevel;
  offenseIndex:number;
  survivalIndex:number;
  coreGuardIndex:number;
  economyIndex:number;
  viabilityIndex:number;
  pressureIndex:number;
  releaseMargin:number;
}
export interface HeroBuildCombinationAudit {
  checkpoints:HeroBuildCombinationCheckpoint[];
  maxViabilitySpread:number;
  minReleaseMargin:number;
  maxReleaseMargin:number;
  archetypeDistinctness:number;
  threatMonotonic:boolean;
  trapCount:number;
  passed:boolean;
}
const THREATS=[0,3,5] as const satisfies readonly ThreatLevel[];
const ARCHETYPES=['burst','cycle','domain','fortress'] as const satisfies readonly BuildArchetype[];
function round(value:number):number{return Math.round(value*10000)/10000;}
function spread(values:readonly number[]):number{return round(Math.max(...values)/Math.max(.0001,Math.min(...values)));}
function archetypeProfile(archetype:BuildArchetype):{offense:number;survival:number;core:number;economy:number}{
  const active={...createDefaultOverdriveState(),activeUntilMs:1};
  const mods=overdriveModifiers(active,archetype,0);
  if(archetype==='burst')return{offense:Math.pow(mods.spellPowerMultiplier,.72)*Math.pow(mods.bossDamageMultiplier,.28),survival:.97,core:.97,economy:1};
  if(archetype==='cycle')return{offense:Math.pow(1/mods.cooldownMultiplier,.72)*Math.pow(mods.fusionPowerMultiplier,.28),survival:1,core:1,economy:1};
  if(archetype==='domain')return{offense:Math.pow(mods.spellPowerMultiplier,.55)*Math.pow(mods.areaMultiplier,.45),survival:1.03,core:1.05,economy:1};
  return{offense:.97,survival:Math.pow(1/mods.heroDamageTakenMultiplier,.58),core:Math.pow(1/mods.coreDamageTakenMultiplier,.68),economy:.99};
}
function legalTraits(heroId:HeroId):RunTraitId[]{return[...RUN_TRAITS.map((trait)=>trait.id),masteryTraitId(heroId)];}

export function heroBuildCombinationCheckpoints():HeroBuildCombinationCheckpoint[]{
  const points:HeroBuildCombinationCheckpoint[]=[];
  for(const hero of HERO_PROFILES){
    const base=heroReleaseModel(hero.id);
    for(const traitId of legalTraits(hero.id)){
      const trait=runTraitBonuses(traitId);
      for(const archetype of ARCHETYPES){
        const build=archetypeProfile(archetype);
        const offense=base.offenseIndex*trait.spellPowerMultiplier/Math.max(.65,trait.cooldownMultiplier)*build.offense;
        const survival=base.survivalIndex*Math.pow(trait.maxHpMultiplier,.55)*Math.pow(trait.moveSpeedMultiplier,.22)/Math.max(.65,trait.heroDamageTakenMultiplier)*build.survival;
        const core=base.coreGuardIndex*Math.pow(trait.maxHpMultiplier,.18)*Math.pow(trait.moveSpeedMultiplier,.10)/Math.max(.55,trait.coreDamageTakenMultiplier)*build.core;
        const economy=trait.goldMultiplier*build.economy;
        const viability=Math.pow(offense,.42)*Math.pow(survival,.27)*Math.pow(core,.23)*Math.pow(economy,.08);
        for(const threat of THREATS){
          const pressure=heroThreatPressureIndex(30,threat);
          points.push({
            heroId:hero.id,traitId,archetype,threat,
            offenseIndex:round(offense),survivalIndex:round(survival),coreGuardIndex:round(core),economyIndex:round(economy),
            viabilityIndex:round(viability),pressureIndex:pressure,releaseMargin:round(viability*1.72/Math.pow(pressure,.45)),
          });
        }
      }
    }
  }
  return points;
}

export function auditHeroBuildCombinations():HeroBuildCombinationAudit{
  const checkpoints=heroBuildCombinationCheckpoints();
  let maxViabilitySpread=1;
  for(const threat of THREATS)maxViabilitySpread=Math.max(maxViabilitySpread,spread(checkpoints.filter((point)=>point.threat===threat).map((point)=>point.viabilityIndex)));
  maxViabilitySpread=round(maxViabilitySpread);
  const margins=checkpoints.map((point)=>point.releaseMargin);
  const minReleaseMargin=round(Math.min(...margins));
  const maxReleaseMargin=round(Math.max(...margins));
  const archetypeAxisMeans=ARCHETYPES.map((archetype)=>{
    const values=checkpoints.filter((point)=>point.archetype===archetype&&point.threat===3);
    const mean=(field:'offenseIndex'|'survivalIndex'|'coreGuardIndex')=>values.reduce((sum,value)=>sum+value[field],0)/Math.max(1,values.length);
    return{offense:mean('offenseIndex'),survival:mean('survivalIndex'),core:mean('coreGuardIndex')};
  });
  const archetypeDistinctness=round(Math.max(
    spread(archetypeAxisMeans.map((value)=>value.offense)),
    spread(archetypeAxisMeans.map((value)=>value.survival)),
    spread(archetypeAxisMeans.map((value)=>value.core)),
  ));
  let threatMonotonic=true;
  for(const hero of HERO_PROFILES)for(const traitId of legalTraits(hero.id))for(const archetype of ARCHETYPES){
    const group=checkpoints.filter((point)=>point.heroId===hero.id&&point.traitId===traitId&&point.archetype===archetype).sort((a,b)=>a.threat-b.threat);
    if(!(group[0]!.releaseMargin>group[1]!.releaseMargin&&group[1]!.releaseMargin>group[2]!.releaseMargin))threatMonotonic=false;
  }
  const trapCount=checkpoints.filter((point)=>point.threat===5&&point.releaseMargin<.62).length;
  const passed=checkpoints.length===240&&maxViabilitySpread<=1.55&&minReleaseMargin>=.62&&maxReleaseMargin<=1.75&&archetypeDistinctness>=1.06&&threatMonotonic&&trapCount===0;
  return{checkpoints,maxViabilitySpread,minReleaseMargin,maxReleaseMargin,archetypeDistinctness,threatMonotonic,trapCount,passed};
}
