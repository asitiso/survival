import type { BossArchetype } from './boss-patterns.js';
import type { HeroId } from './hero-profiles.js';

export type RelicId =
  | 'abyss-eye'
  | 'chrono-shard'
  | 'guardian-heart'
  | 'ember-crown'
  | 'winter-heart'
  | 'storm-core'
  | 'oath-seal'
  | 'inferno-heart'
  | 'summoner-sigil'
  | 'juggernaut-core'
  | 'phoenix-brand'
  | 'zero-crystal'
  | 'storm-crown'
  | 'citadel-sigil';

export interface RelicDefinition {
  id: RelicId;
  name: string;
  description: string;
  accent: string;
  heroId: HeroId | null;
  bossArchetype: BossArchetype | null;
  masteryLevel?: number;
}

export interface RelicModifiers {
  spellPowerMultiplier: number;
  cooldownMultiplier: number;
  moveSpeedMultiplier: number;
  heroDamageTakenMultiplier: number;
  areaMultiplier: number;
  goldMultiplier: number;
  pickupMultiplier: number;
  coreDamageTakenMultiplier: number;
  arkanExplosionChanceBonus: number;
  arkanExplosionRadiusMultiplier: number;
  kainOverloadGainMultiplier: number;
  kainOverloadMaxCooldownReduction: number;
  edricAuraRadiusBonus: number;
  edricHeroAuraMultiplier: number;
  edricCoreAuraMultiplier: number;
}

const RELICS: readonly RelicDefinition[] = [
  {
    id: 'abyss-eye', name: '심연의 눈', heroId: null, bossArchetype: null, accent: '#d98cff',
    description: '마법 피해 +24% · 받는 피해 +12%',
  },
  {
    id: 'chrono-shard', name: '크로노 파편', heroId: null, bossArchetype: null, accent: '#70d8ff',
    description: '마법 쿨타임 -16% · 이동속도 -8%',
  },
  {
    id: 'guardian-heart', name: '수호자의 심장', heroId: null, bossArchetype: null, accent: '#f0ca72',
    description: '수호핵 피해 -35% · 금화 획득 -15%',
  },
  {
    id: 'ember-crown', name: '잿불 왕관', heroId: 'arkan', bossArchetype: null, accent: '#ff744f',
    description: '연쇄폭발 확률 +17% · 폭발 범위 +30%',
  },
  {
    id: 'winter-heart', name: '영원의 겨울심장', heroId: 'seria', bossArchetype: null, accent: '#7ce1ff',
    description: '모든 마법 범위 +25% · 쿨타임 -8%',
  },
  {
    id: 'storm-core', name: '폭풍핵', heroId: 'kain', bossArchetype: null, accent: '#a989ff',
    description: '과부하 충전 +55% · 최대 과부하 쿨감 30%',
  },
  {
    id: 'oath-seal', name: '수호의 맹세인', heroId: 'edric', bossArchetype: null, accent: '#f2c96f',
    description: '수호 오라 +80 · 오라 피해감소 강화',
  },
  {
    id: 'inferno-heart', name: '폭군의 화핵', heroId: null, bossArchetype: 'inferno', accent: '#ff7049',
    description: '마법 피해 +16% · 범위 +12% · 받는 피해 +6%',
  },
  {
    id: 'summoner-sigil', name: '군주의 소환인', heroId: null, bossArchetype: 'summoner', accent: '#69e7a5',
    description: '쿨타임 -10% · 흡수거리 +20% · 수호핵 피해 +8%',
  },
  {
    id: 'juggernaut-core', name: '거인의 동력핵', heroId: null, bossArchetype: 'juggernaut', accent: '#ffc15d',
    description: '이동속도 +12% · 받는 피해 -12% · 쿨타임 +6%',
  },
  {
    id: 'phoenix-brand', name: '불사조의 낙인', heroId: 'arkan', bossArchetype: null, masteryLevel: 15, accent: '#ff4f3f',
    description: '마법 피해 +12% · 연쇄폭발 확률 +8%',
  },
  {
    id: 'zero-crystal', name: '영점 결정', heroId: 'seria', bossArchetype: null, masteryLevel: 15, accent: '#a7f4ff',
    description: '마법 범위 +14% · 쿨타임 -5%',
  },
  {
    id: 'storm-crown', name: '폭풍 왕관', heroId: 'kain', bossArchetype: null, masteryLevel: 15, accent: '#8f72ff',
    description: '과부하 충전 +25% · 이동속도 +5%',
  },
  {
    id: 'citadel-sigil', name: '성채의 문장', heroId: 'edric', bossArchetype: null, masteryLevel: 15, accent: '#ffe197',
    description: '수호 오라 +40 · 수호핵 피해 -22%',
  },
] as const;

const NEUTRAL: RelicModifiers = {
  spellPowerMultiplier: 1,
  cooldownMultiplier: 1,
  moveSpeedMultiplier: 1,
  heroDamageTakenMultiplier: 1,
  areaMultiplier: 1,
  goldMultiplier: 1,
  pickupMultiplier: 1,
  coreDamageTakenMultiplier: 1,
  arkanExplosionChanceBonus: 0,
  arkanExplosionRadiusMultiplier: 1,
  kainOverloadGainMultiplier: 1,
  kainOverloadMaxCooldownReduction: 0.20,
  edricAuraRadiusBonus: 0,
  edricHeroAuraMultiplier: 0.78,
  edricCoreAuraMultiplier: 0.74,
};

export function relicDefinition(id: RelicId): RelicDefinition {
  const found = RELICS.find((entry) => entry.id === id);
  if (!found) throw new Error(`Unknown relic: ${id}`);
  return found;
}

export function relicDisplayName(id: RelicId | null): string {
  return id ? relicDefinition(id).name : '없음';
}

export function relicCandidates(
  heroId: HeroId,
  activeRelic: RelicId | null,
  rng: () => number = Math.random,
  bossArchetype: BossArchetype | null = null,
  masteryLevel = 1,
): RelicId[] {
  const pool = RELICS
    .filter((entry) => entry.heroId === null || entry.heroId === heroId)
    .filter((entry) => entry.bossArchetype === null || entry.bossArchetype === bossArchetype)
    .filter((entry) => entry.masteryLevel === undefined || masteryLevel >= entry.masteryLevel)
    .map((entry) => entry.id)
    .filter((id) => id !== activeRelic);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.max(0, Math.floor(rng() * (i + 1))));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool;
}

export function relicModifiers(id: RelicId | null, heroId: HeroId): RelicModifiers {
  const out: RelicModifiers = { ...NEUTRAL };
  if (!id) return out;

  if (id === 'abyss-eye') {
    out.spellPowerMultiplier = 1.24;
    out.heroDamageTakenMultiplier = 1.12;
  } else if (id === 'chrono-shard') {
    out.cooldownMultiplier = 0.84;
    out.moveSpeedMultiplier = 0.92;
  } else if (id === 'guardian-heart') {
    out.coreDamageTakenMultiplier = 0.65;
    out.goldMultiplier = 0.85;
  } else if (id === 'ember-crown' && heroId === 'arkan') {
    out.arkanExplosionChanceBonus = 0.17;
    out.arkanExplosionRadiusMultiplier = 1.30;
  } else if (id === 'winter-heart' && heroId === 'seria') {
    out.areaMultiplier = 1.25;
    out.cooldownMultiplier = 0.92;
  } else if (id === 'storm-core' && heroId === 'kain') {
    out.kainOverloadGainMultiplier = 1.55;
    out.kainOverloadMaxCooldownReduction = 0.30;
  } else if (id === 'oath-seal' && heroId === 'edric') {
    out.edricAuraRadiusBonus = 80;
    out.edricHeroAuraMultiplier = 0.70;
    out.edricCoreAuraMultiplier = 0.65;
  } else if (id === 'inferno-heart') {
    out.spellPowerMultiplier = 1.16;
    out.areaMultiplier = 1.12;
    out.heroDamageTakenMultiplier = 1.06;
  } else if (id === 'summoner-sigil') {
    out.cooldownMultiplier = 0.90;
    out.pickupMultiplier = 1.20;
    out.coreDamageTakenMultiplier = 1.08;
  } else if (id === 'juggernaut-core') {
    out.moveSpeedMultiplier = 1.12;
    out.heroDamageTakenMultiplier = 0.88;
    out.cooldownMultiplier = 1.06;
  } else if (id === 'phoenix-brand' && heroId === 'arkan') {
    out.spellPowerMultiplier = 1.12;
    out.arkanExplosionChanceBonus = 0.08;
  } else if (id === 'zero-crystal' && heroId === 'seria') {
    out.areaMultiplier = 1.14;
    out.cooldownMultiplier = 0.95;
  } else if (id === 'storm-crown' && heroId === 'kain') {
    out.kainOverloadGainMultiplier = 1.25;
    out.moveSpeedMultiplier = 1.05;
    out.kainOverloadMaxCooldownReduction = 0.26;
  } else if (id === 'citadel-sigil' && heroId === 'edric') {
    out.edricAuraRadiusBonus = 40;
    out.coreDamageTakenMultiplier = 0.78;
  }
  return out;
}
