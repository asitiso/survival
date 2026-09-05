import { clamp } from '../../core/math.js';
import type { BossArchetype } from '../boss-patterns.js';
import type { MythicSafeZoneState } from './mythic-safe-zone.js';

export interface MythicSafeZonePressure {
  specialCadenceMultiplier:number;
  summonCountMultiplier:number;
  dashDistanceMultiplier:number;
  bossDamageTakenMultiplier:number;
}

export function mythicSafeZonePressure(archetype:BossArchetype,zone:MythicSafeZoneState|null,destroyedWeakpointRatio:number):MythicSafeZonePressure{
  if(!zone)return{specialCadenceMultiplier:1,summonCountMultiplier:1,dashDistanceMultiplier:1,bossDamageTakenMultiplier:1};
  let special=1,summon=1,dash=1,bossDamage=1;
  if(zone.phase==='stable'){special=1.10;summon=.92;dash=.92;bossDamage=1.04;}
  else if(zone.phase==='collapse'){special=.94;summon=1.03;dash=1.04;bossDamage=1.01;}
  else if(zone.phase==='collapsed'){special=.82;summon=1.12;dash=1.12;bossDamage=1;}
  else{special=1.14;summon=.88;dash=.90;bossDamage=1.05;}

  if(archetype==='inferno')special*=.98;
  else if(archetype==='summoner'){summon*=1.055;dash*=.96;}
  else if(archetype==='juggernaut'){dash*=1.055;summon*=.94;}
  else if(archetype==='abyssWitch')special*=.97;
  else if(archetype==='twinMaw'){summon*=1.025;dash*=1.025;}
  else {special*=.95;summon*=.95;}

  const cleared=clamp(Number.isFinite(destroyedWeakpointRatio)?destroyedWeakpointRatio:0,0,1);
  special+=cleared*.12;
  summon*=1-cleared*.10;
  dash*=1-cleared*.08;
  bossDamage*=1+cleared*.01;

  return{
    specialCadenceMultiplier:clamp(special,.78,1.16),
    summonCountMultiplier:clamp(summon,.86,1.18),
    dashDistanceMultiplier:clamp(dash,.86,1.18),
    bossDamageTakenMultiplier:clamp(bossDamage,.98,1.06),
  };
}
