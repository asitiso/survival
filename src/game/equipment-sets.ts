import type { EquipmentState } from '../domain/types.js';
import type { EquipmentBonuses } from './shop-data.js';

export const EQUIPMENT_SETS = [
  { id: 'sage', name: '현자의 서약', accent: '#c78cff', items: ['arcane-staff', 'iron-robe', 'sage-amulet'],
    two: { spellPowerMultiplier: 1.15 }, three: { damageTakenMultiplier: .85, coreDamageTakenMultiplier: .85 },
    twoText: '마법 피해 +15%', threeText: '영웅·수호핵 받는 피해 -15%' },
  { id: 'storm', name: '폭풍 추적자', accent: '#68d7ff', items: ['rapid-wand', 'gale-cloak', 'storm-ring'],
    two: { cooldownMultiplier: .90 }, three: { spellPowerMultiplier: 1.20, damageTakenMultiplier: .60, coreDamageTakenMultiplier: .70 },
    twoText: '재사용시간 -10%', threeText: '마법 피해 +20% · 영웅 피해 -40% · 수호핵 피해 -30%' },
  { id: 'bastion', name: '성채의 불꽃', accent: '#f0c46b', items: ['blast-rod', 'guardian-plate', 'bastion-talisman'],
    two: { areaMultiplier: 1.15, spellPowerMultiplier: 1.30 }, three: { damageTakenMultiplier: .82, coreDamageTakenMultiplier: .85, spellPowerMultiplier: 1.60 },
    twoText: '범위 +15% · 마법 피해 +30%', threeText: '영웅 피해 -18% · 수호핵 피해 -15% · 마법 피해 +60%' },
  { id: 'fortune', name: '황금 탐험가', accent: '#69e0b5', items: ['golden-wand', 'magnet-cloak', 'fortune-charm'],
    two: { goldMultiplier: 1.20 }, three: { spellPowerMultiplier: 1.85, cooldownMultiplier: .85, damageTakenMultiplier: .60, coreDamageTakenMultiplier: .70 },
    twoText: '금화 획득 +20%', threeText: '마법 피해 +85% · 쿨타임 -15% · 영웅 피해 -40% · 수호핵 피해 -30%' },
] as const;

const GENESIS_LEGACY = {
  id: 'genesis-legacy', name: '창세의 유산', accent: '#f3cf67',
  items: ['celestial-fusion-staff', 'world-tree-armor', 'fate-core'],
  two: {},
  three: { spellPowerMultiplier: 1.35, cooldownMultiplier: .88, damageTakenMultiplier: .78, coreDamageTakenMultiplier: .78 },
  twoText: '', threeText: '마법 피해 +35% · 재사용시간 -12% · 영웅·수호핵 받는 피해 -22%',
} as const;

export function equipmentSetForItem(id: string) {
  return EQUIPMENT_SETS.find(set => (set.items as readonly string[]).includes(id))
    ?? (GENESIS_LEGACY.items.includes(id as never) ? GENESIS_LEGACY : null);
}

export function equipmentSetStates(state: EquipmentState) {
  const items = [state.weapon, state.armor, state.accessory].filter(item => item != null);
  const regularStates = EQUIPMENT_SETS.map(set => {
    const worn = items.filter(item => (set.items as readonly string[]).includes(item.id));
    const highCount = worn.filter(item => item.rank >= 2).length;
    const rareCount = worn.filter(item => item.rank >= 3).length;
    return { ...set, count: worn.length, highCount, rareCount, twoActive: highCount >= 2, threeActive: rareCount >= 3 };
  });
  const genesisWorn = items.filter(item => (GENESIS_LEGACY.items as readonly string[]).includes(item.id));
  if (genesisWorn.length !== GENESIS_LEGACY.items.length) return regularStates;
  return [...regularStates, {
    ...GENESIS_LEGACY,
    count: genesisWorn.length,
    highCount: genesisWorn.filter(item => item.rank >= 2).length,
    rareCount: genesisWorn.filter(item => item.rank >= 3).length,
    twoActive: false,
    threeActive: true,
  }];
}

export function applyEquipmentSets(bonuses: EquipmentBonuses, state: EquipmentState): EquipmentBonuses {
  const result = { ...bonuses };
  for (const set of equipmentSetStates(state)) {
    for (const effect of [set.twoActive ? set.two : {}, set.threeActive ? set.three : {}]) {
      for (const [key, factor] of Object.entries(effect as Partial<EquipmentBonuses>)) result[key as keyof EquipmentBonuses] *= factor;
    }
  }
  return result;
}

export function equipmentSetChange(before: EquipmentState, after: EquipmentState): string {
  const a = equipmentSetStates(before), b = equipmentSetStates(after);
  const changes: string[] = [];
  const ids = new Set([...a, ...b].map((set) => set.id));
  for (const id of ids) {
    const previous = a.find((set) => set.id === id);
    const next = b.find((set) => set.id === id);
    for (const tier of ['twoActive', 'threeActive'] as const) {
      const wasActive = previous?.[tier] ?? false;
      const isActive = next?.[tier] ?? false;
      if (wasActive !== isActive) changes.push(`${next?.name ?? previous?.name} ${tier === 'twoActive' ? 2 : 3}세트 ${isActive ? '발동' : '해제'}`);
    }
  }
  return changes.join(' · ');
}
