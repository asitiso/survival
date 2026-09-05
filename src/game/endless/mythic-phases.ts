import { clamp } from '../../core/math.js';
import type { BossArchetype } from '../boss-patterns.js';
import type { MythicBossProfile } from './mythic-boss.js';

export interface MythicPhaseProfile {
  phase: 0 | 1 | 2 | 3;
  label: string;
  channels: BossArchetype[];
  bossDamageTakenMultiplier: number;
  specialCadenceMultiplier: number;
  summonCountMultiplier: number;
  dashDistanceMultiplier: number;
}

const NEUTRAL: MythicPhaseProfile = {
  phase:0,
  label:'',
  channels:[],
  bossDamageTakenMultiplier:1,
  specialCadenceMultiplier:1,
  summonCountMultiplier:1,
  dashDistanceMultiplier:1,
};

function rotate<T>(items: readonly T[], offset: number): T[] {
  if (items.length === 0) return [];
  const n = ((offset % items.length) + items.length) % items.length;
  return [...items.slice(n), ...items.slice(0,n)];
}

export function mythicPhaseProfile(profile: MythicBossProfile, hpRatio: number, weakpointRatio: number): MythicPhaseProfile {
  if (!profile.active) return { ...NEUTRAL, channels:[] };
  const hp = clamp(hpRatio,0,1);
  const phase: 1|2|3 = hp >= .7 ? 1 : hp >= .35 ? 2 : 3;
  const weakpoints = clamp(weakpointRatio,0,1);
  const cleared = 1 - weakpoints;
  const base = phase === 1
    ? { damageTaken:.94, cadence:.96, summons:1.02, dash:1.02 }
    : phase === 2
      ? { damageTaken:.92, cadence:.88, summons:1.1, dash:1.08 }
      : { damageTaken:.9, cadence:.8, summons:1.16, dash:1.14 };
  return {
    phase,
    label:`MYTHIC PHASE ${phase}`,
    channels:rotate(profile.channels, phase-1),
    bossDamageTakenMultiplier:clamp(base.damageTaken + cleared*.2, .88, 1.15),
    specialCadenceMultiplier:clamp(base.cadence + cleared*.34, .78, 1.2),
    summonCountMultiplier:clamp(base.summons - cleared*.34, .82, 1.18),
    dashDistanceMultiplier:clamp(base.dash - cleared*.18, .9, 1.16),
  };
}
