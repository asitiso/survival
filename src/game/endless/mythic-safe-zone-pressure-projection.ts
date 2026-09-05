import type { BossArchetype } from '../boss-patterns.js';
import type { MythicSafeZonePhase, MythicSafeZoneState } from './mythic-safe-zone.js';
import { mythicSafeZonePressure } from './mythic-safe-zone-pressure.js';
import type { MythicSafeZonePressureEffectIdentityId } from './mythic-safe-zone-pressure-effect-identity-assets.js';

export interface MythicSafeZonePressureEffectProjection{
  effectId:MythicSafeZonePressureEffectIdentityId;before:1;after:number;deltaPercent:number;saliencePercent:number;label:string;
}
export interface MythicSafeZonePressureEffectsProjection{
  archetype:BossArchetype;phase:MythicSafeZonePhase|null;destroyedWeakpointRatio:number;
  effects:MythicSafeZonePressureEffectProjection[];primaryEffects:MythicSafeZonePressureEffectProjection[];maxPrimaryEffects:2;
}

const round3=(value:number):number=>Math.round((value+Number.EPSILON)*1000)/1000;
const round1=(value:number):number=>Math.round((value+Number.EPSILON)*10)/10;
const pct=(value:number):string=>Number.isInteger(value)?`${Math.abs(value)}`:`${Math.abs(value).toFixed(1)}`;
const signed=(value:number):string=>value>0?`+${pct(value)}%`:value<0?`-${pct(value)}%`:'±0%';

function effect(effectId:MythicSafeZonePressureEffectIdentityId,afterRaw:number,label:string):MythicSafeZonePressureEffectProjection{
  const after=round3(afterRaw),deltaPercent=round1((afterRaw-1)*100);
  return {effectId,before:1,after,deltaPercent,saliencePercent:Math.abs(deltaPercent),label:`${label} ${signed(deltaPercent)}`};
}

export function projectMythicSafeZonePressureEffects(archetype:BossArchetype,zone:MythicSafeZoneState|null,destroyedWeakpointRatio:number):MythicSafeZonePressureEffectsProjection{
  const ratio=Math.max(0,Math.min(1,Number.isFinite(destroyedWeakpointRatio)?destroyedWeakpointRatio:0));
  const pressure=mythicSafeZonePressure(archetype,zone,ratio);
  const effects=[
    effect('special-cadence',pressure.specialCadenceMultiplier,'특수주기'),
    effect('summon-pressure',pressure.summonCountMultiplier,'소환'),
    effect('dash-distance',pressure.dashDistanceMultiplier,'돌진거리'),
    effect('boss-vulnerability',pressure.bossDamageTakenMultiplier,'보스피해'),
  ];
  const primaryEffects=effects.map((value,index)=>({value,index})).sort((a,b)=>b.value.saliencePercent-a.value.saliencePercent||a.index-b.index).slice(0,2).map(entry=>entry.value);
  return {archetype,phase:zone?.phase??null,destroyedWeakpointRatio:ratio,effects,primaryEffects,maxPrimaryEffects:2};
}

export function mythicSafeZonePressureEffectHint(projection:MythicSafeZonePressureEffectsProjection,limit=2):string{
  return projection.primaryEffects.slice(0,Math.max(0,Math.min(2,limit))).map(effect=>effect.label).join(' · ');
}
