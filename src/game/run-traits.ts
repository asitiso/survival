export type RunTraitId = 'destruction' | 'rapidCasting' | 'goldSense' | 'guardianOath' | 'infernalPact' | 'glacialFocus' | 'stormPursuit' | 'bastionVow';

export interface RunTraitBonuses {
  maxHpMultiplier: number;
  spellPowerMultiplier: number;
  cooldownMultiplier: number;
  moveSpeedMultiplier: number;
  goldMultiplier: number;
  heroDamageTakenMultiplier: number;
  coreDamageTakenMultiplier: number;
}

export interface RunTrait {
  id: RunTraitId;
  name: string;
  description: string;
  accent: string;
}

export const RUN_TRAITS: readonly RunTrait[] = [
  { id: 'destruction', name: '파괴 본능', description: '마법 피해 +12% · 최대 HP -8%', accent: '#ff7967' },
  { id: 'rapidCasting', name: '신속 영창', description: '재사용시간 -10% · 받는 피해 +8%', accent: '#69d3ff' },
  { id: 'goldSense', name: '황금 감각', description: '금화 획득 +25% · 마법 피해 -6%', accent: '#f3d36b' },
  { id: 'guardianOath', name: '수호 맹세', description: '수호핵 피해 -20% · 이동속도 -5%', accent: '#9dd9b1' },
];

export const MASTERY_RUN_TRAITS: readonly RunTrait[] = [
  { id: 'infernalPact', name: '지옥의 계약', description: '마법 피해 +18% · 최대 HP -12%', accent: '#ff5f48' },
  { id: 'glacialFocus', name: '빙정 집중', description: '마법 피해 +10% · 쿨타임 -6% · 받는 피해 +5%', accent: '#75e6ff' },
  { id: 'stormPursuit', name: '폭풍 추격', description: '쿨타임 -14% · 최대 HP -8%', accent: '#9f89ff' },
  { id: 'bastionVow', name: '성채의 서약', description: '수호핵 피해 -32% · 이동속도 -10%', accent: '#f2cf73' },
];


const BONUSES: Record<RunTraitId, RunTraitBonuses> = {
  destruction: {
    maxHpMultiplier: 0.92, spellPowerMultiplier: 1.12, cooldownMultiplier: 1, moveSpeedMultiplier: 1,
    goldMultiplier: 1, heroDamageTakenMultiplier: 1, coreDamageTakenMultiplier: 1,
  },
  rapidCasting: {
    maxHpMultiplier: 1, spellPowerMultiplier: 1, cooldownMultiplier: 0.90, moveSpeedMultiplier: 1,
    goldMultiplier: 1, heroDamageTakenMultiplier: 1.08, coreDamageTakenMultiplier: 1,
  },
  goldSense: {
    maxHpMultiplier: 1, spellPowerMultiplier: 0.94, cooldownMultiplier: 1, moveSpeedMultiplier: 1,
    goldMultiplier: 1.25, heroDamageTakenMultiplier: 1, coreDamageTakenMultiplier: 1,
  },
  guardianOath: {
    maxHpMultiplier: 1, spellPowerMultiplier: 1, cooldownMultiplier: 1, moveSpeedMultiplier: 0.95,
    goldMultiplier: 1, heroDamageTakenMultiplier: 1, coreDamageTakenMultiplier: 0.80,
  },
  infernalPact: {
    maxHpMultiplier: 0.88, spellPowerMultiplier: 1.18, cooldownMultiplier: 1, moveSpeedMultiplier: 1,
    goldMultiplier: 1, heroDamageTakenMultiplier: 1, coreDamageTakenMultiplier: 1,
  },
  glacialFocus: {
    maxHpMultiplier: 1, spellPowerMultiplier: 1.10, cooldownMultiplier: 0.94, moveSpeedMultiplier: 1,
    goldMultiplier: 1, heroDamageTakenMultiplier: 1.05, coreDamageTakenMultiplier: 1,
  },
  stormPursuit: {
    maxHpMultiplier: 0.92, spellPowerMultiplier: 1, cooldownMultiplier: 0.86, moveSpeedMultiplier: 1,
    goldMultiplier: 1, heroDamageTakenMultiplier: 1, coreDamageTakenMultiplier: 1,
  },
  bastionVow: {
    maxHpMultiplier: 1, spellPowerMultiplier: 1, cooldownMultiplier: 1, moveSpeedMultiplier: 0.90,
    goldMultiplier: 1, heroDamageTakenMultiplier: 1, coreDamageTakenMultiplier: 0.68,
  },
};

export function runTrait(id: RunTraitId): RunTrait {
  return [...RUN_TRAITS, ...MASTERY_RUN_TRAITS].find((trait) => trait.id === id) ?? RUN_TRAITS[0]!;
}

export function runTraitBonuses(id: RunTraitId | null): RunTraitBonuses {
  if (id === null) {
    return {
      maxHpMultiplier: 1, spellPowerMultiplier: 1, cooldownMultiplier: 1, moveSpeedMultiplier: 1,
      goldMultiplier: 1, heroDamageTakenMultiplier: 1, coreDamageTakenMultiplier: 1,
    };
  }
  return BONUSES[id];
}
