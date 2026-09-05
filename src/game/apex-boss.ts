import { bossArchetypeForOrdinal, type BossArchetype } from './boss-patterns.js';

export interface ApexBossProfile {
  active: boolean;
  secondaryArchetype: BossArchetype | null;
  label: string;
}

export interface ApexPressureModifiers {
  specialCadenceMultiplier: number;
  projectileDensityMultiplier: number;
  summonCountMultiplier: number;
}

export function apexPatternPair(primary: BossArchetype, ordinal: number): readonly [BossArchetype, BossArchetype] {
  let offset = 1 + (Math.max(0, Math.floor(ordinal)) % 5);
  let secondary = bossArchetypeForOrdinal(Math.max(0, ordinal) + offset);
  while (secondary === primary) {
    offset += 1;
    secondary = bossArchetypeForOrdinal(Math.max(0, ordinal) + offset);
  }
  return [primary, secondary];
}

export function apexBossProfile(elapsed: number, threatLevel: number, bossOrdinal: number): ApexBossProfile {
  const active = elapsed >= 1200 && threatLevel >= 3 && Math.max(0, Math.floor(bossOrdinal)) % 3 === 2;
  if (!active) return { active: false, secondaryArchetype: null, label: '' };
  const primary = bossArchetypeForOrdinal(bossOrdinal);
  const [, secondary] = apexPatternPair(primary, bossOrdinal);
  return { active: true, secondaryArchetype: secondary, label: 'APEX' };
}

export function apexPressureModifiers(active: boolean): ApexPressureModifiers {
  return active
    ? { specialCadenceMultiplier: 0.86, projectileDensityMultiplier: 1.28, summonCountMultiplier: 1.16 }
    : { specialCadenceMultiplier: 1, projectileDensityMultiplier: 1, summonCountMultiplier: 1 };
}
