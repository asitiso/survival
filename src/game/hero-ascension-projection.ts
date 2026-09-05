import { heroAscensionModifiers, type HeroAscensionId, type HeroAscensionModifiers } from './endless/hero-ascension.js';
import type { HeroAscensionModifierIdentityId } from './hero-ascension-modifier-identity-assets.js';
import type { HeroAscensionBuildDirectionId } from './hero-ascension-build-direction-identity-assets.js';

const PROPERTY_BY_ID:Readonly<Record<HeroAscensionModifierIdentityId,keyof HeroAscensionModifiers>>={
  'spell-power':'spellPowerMultiplier',cooldown:'cooldownMultiplier',area:'areaMultiplier','move-speed':'moveSpeedMultiplier',
  'hero-guard':'heroDamageTakenMultiplier','core-guard':'coreDamageTakenMultiplier','fusion-power':'fusionPowerMultiplier','boss-damage':'bossDamageMultiplier',
};
const REDUCTION_IDS=new Set<HeroAscensionModifierIdentityId>(['cooldown','hero-guard','core-guard']);
const LABEL:Readonly<Record<HeroAscensionModifierIdentityId,string>>={
  'spell-power':'마법 피해',cooldown:'쿨타임',area:'범위','move-speed':'이동속도','hero-guard':'영웅 피해','core-guard':'수호핵 피해','fusion-power':'융합 위력','boss-damage':'보스 피해',
};
export interface HeroAscensionProjectedEffect{id:HeroAscensionModifierIdentityId;before:number;after:number;deltaPercent:number;alreadyActive:boolean;}
export interface HeroAscensionProjection{optionId:HeroAscensionId;before:HeroAscensionModifiers;after:HeroAscensionModifiers;effects:readonly HeroAscensionProjectedEffect[];modifierIds:readonly HeroAscensionModifierIdentityId[];directionId:HeroAscensionBuildDirectionId;}
const round=(value:number,places=4)=>Number(value.toFixed(places));
const changed=(a:number,b:number)=>Math.abs(a-b)>1e-9;
const percent=(id:HeroAscensionModifierIdentityId,before:number,after:number)=>REDUCTION_IDS.has(id)?(1-after/before)*100:(after/before-1)*100;

export function projectHeroAscensionSelection(selected:readonly HeroAscensionId[],optionId:HeroAscensionId):HeroAscensionProjection{
  const clean=[...new Set(selected)].filter(id=>id!==optionId).slice(0,3);
  const before=heroAscensionModifiers(clean);
  const after=heroAscensionModifiers([...clean,optionId].slice(0,3));
  const effects=Object.entries(PROPERTY_BY_ID).flatMap(([rawId,key])=>{
    const id=rawId as HeroAscensionModifierIdentityId,beforeValue=before[key],afterValue=after[key];
    if(!changed(beforeValue,afterValue))return[];
    return[{id,before:round(beforeValue),after:round(afterValue),deltaPercent:round(percent(id,beforeValue,afterValue),2),alreadyActive:changed(beforeValue,1)}];
  });
  const activeCount=effects.filter(effect=>effect.alreadyActive).length;
  const directionId:HeroAscensionBuildDirectionId=activeCount===0?'expand':activeCount===effects.length?'focus':'hybrid';
  return{optionId,before,after,effects,modifierIds:effects.map(effect=>effect.id),directionId};
}

const fmt=(value:number)=>{const rounded=Math.round(value*10)/10;return Number.isInteger(rounded)?String(Math.trunc(rounded)):rounded.toFixed(1);};
export function heroAscensionProjectionHint(projection:HeroAscensionProjection):string{
  const parts=projection.effects.slice(0,2).map(effect=>`${LABEL[effect.id]} ${REDUCTION_IDS.has(effect.id)?'-':'+'}${fmt(Math.abs(effect.deltaPercent))}%`);
  return parts.length?`실효 · ${parts.join(' · ')}`:'실효 · 변화 없음';
}
