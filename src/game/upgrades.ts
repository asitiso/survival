import type { Hero } from './entities.js';
import type { SpellId, SpellSystem } from './spells.js';
import type { HeroId } from './hero-profiles.js';
import type { BossArchetype } from './boss-patterns.js';
import { heroSpellIdentity, heroSpellName } from './hero-spells.js';
import { relicCandidates, relicDefinition, type RelicId } from './relics.js';
import { fusionCandidates, fusionDefinition, fusionHeroName, type FusionId } from './spell-fusions.js';

export type UpgradeId = SpellId | 'maxHp' | 'moveSpeed' | 'spellPower' | 'cooldown' | 'pickupRadius';

export interface UpgradeChoice {
  id: UpgradeId;
  title: string;
  description: string;
  accent: string;
}

export interface UpgradeRewardChoice extends UpgradeChoice {
  kind: 'upgrade';
}

export interface RelicRewardChoice {
  kind: 'relic';
  id: `relic:${RelicId}`;
  relicId: RelicId;
  title: string;
  description: string;
  accent: string;
}

export interface FusionRewardChoice {
  kind: 'fusion';
  id: `fusion:${FusionId}`;
  fusionId: FusionId;
  title: string;
  description: string;
  accent: string;
}

export type BossRewardChoice = UpgradeRewardChoice | RelicRewardChoice | FusionRewardChoice;

const SPELL_COPY: Record<SpellId, { title: string; accent: string }> = {
  fireBolt: { title: '화염탄 강화', accent: '#ff7a45' },
  chainLightning: { title: '연쇄번개 강화', accent: '#72d7ff' },
  frostNova: { title: '서리폭발 강화', accent: '#a9e8ff' },
  flameField: { title: '화염장판 강화', accent: '#ffaf55' },
  meteorStorm: { title: '메테오 강화', accent: '#ff5d4a' },
  blackHole: { title: '블랙홀 강화', accent: '#c083ff' },
};

export function applyUpgrade(id: UpgradeId, hero: Hero, spells: SpellSystem): void {
  if (id in spells.levels) {
    spells.levelUp(id as SpellId);
    return;
  }
  switch (id) {
    case 'maxHp':
      hero.maxHp += 42;
      hero.hp = Math.min(hero.maxHp, hero.hp + 42);
      break;
    case 'moveSpeed': hero.speed *= 1.075; break;
    case 'spellPower': hero.spellPower *= 1.12; break;
    case 'cooldown': hero.cooldownMultiplier = Math.max(0.55, hero.cooldownMultiplier * 0.94); break;
    case 'pickupRadius': hero.pickupRadius += 28; break;
  }
}

export function buildUpgradeChoices(hero: Hero, spells: SpellSystem, rng: () => number = Math.random): UpgradeChoice[] {
  const pool: UpgradeChoice[] = [];
  const normalSpells: SpellId[] = ['fireBolt', 'chainLightning', 'frostNova', 'flameField'];
  for (const spell of normalSpells) {
    if (spells.levels[spell] < 10) {
      const next = spells.levels[spell] + 1;
      const milestone = next === 5 ? '1차 진화 · 공격 형태 변화' : next === 10 ? '최종 진화 · 공격 형태 대폭 변화' : '피해/범위/연사 성능 상승';
      pool.push({ id: spell, title: `${heroSpellName(hero.profileId, spell)} 강화`, description: `Lv.${next} · ${milestone}`, accent: heroSpellIdentity(hero.profileId, spell).primary });
    }
  }
  pool.push(
    { id: 'spellPower', title: '마력 증폭', description: `모든 마법 피해 +12%`, accent: '#df9dff' },
    { id: 'cooldown', title: '고속 영창', description: `모든 마법 재사용시간 -6%`, accent: '#68c9ff' },
    { id: 'maxHp', title: '생명 각인', description: `최대 HP +42 · 즉시 42 회복`, accent: '#ff7185' },
    { id: 'moveSpeed', title: '질풍 걸음', description: `이동속도 +7.5%`, accent: '#6fe7bd' },
    { id: 'pickupRadius', title: '마력 자석', description: `경험치·금화 흡수거리 +28`, accent: '#f3d66d' },
  );

  const result: UpgradeChoice[] = [];
  while (result.length < 3 && pool.length > 0) {
    const raw = rng();
    const index = Math.min(pool.length - 1, Math.max(0, Math.floor(raw * pool.length)));
    const [choice] = pool.splice(index, 1);
    if (choice) result.push(choice);
  }
  return result;
}


export function buildBossRewardChoices(
  spells: SpellSystem,
  rng: () => number = Math.random,
  heroId: HeroId = 'arkan',
  activeRelic: RelicId | null = null,
  bossArchetype: BossArchetype | null = null,
  activeFusions: readonly FusionId[] = [],
  masteryLevel = 1,
): BossRewardChoice[] {
  const upgrades: UpgradeRewardChoice[] = [];
  for (const spell of ['meteorStorm', 'blackHole'] as const) {
    if (spells.levels[spell] >= 10) continue;
    const next = spells.levels[spell] + 1;
    upgrades.push({
      kind: 'upgrade',
      id: spell,
      title: `${heroSpellName(heroId, spell)} 각성`,
      description: `궁극기 Lv.${next} · 위력/범위/재사용 성능 상승`,
      accent: heroSpellIdentity(heroId, spell).primary,
    });
  }

  const fallback: UpgradeRewardChoice[] = [
    { kind: 'upgrade', id: 'spellPower', title: '대마력 증폭', description: '모든 마법 피해 +12%', accent: '#e49cff' },
    { kind: 'upgrade', id: 'cooldown', title: '시간 압축', description: '모든 마법 재사용시간 -6%', accent: '#6dcfff' },
    { kind: 'upgrade', id: 'maxHp', title: '불굴의 생명력', description: '최대 HP +42 · 즉시 42 회복', accent: '#ff7587' },
  ];

  while (upgrades.length < 2 && fallback.length > 0) {
    const index = Math.min(fallback.length - 1, Math.max(0, Math.floor(rng() * fallback.length)));
    const [choice] = fallback.splice(index, 1);
    if (choice) upgrades.push(choice);
  }

  const candidates = relicCandidates(heroId, activeRelic, rng, bossArchetype, masteryLevel);
  const relicId = candidates[0] ?? activeRelic ?? 'abyss-eye';
  const relic = relicDefinition(relicId);
  const replacing = activeRelic !== null;
  const relicChoice: RelicRewardChoice = {
    kind: 'relic',
    id: `relic:${relicId}`,
    relicId,
    title: `유물 · ${relic.name}`,
    description: `${replacing ? '현재 유물 교체' : '유물 장착'} · ${relic.description}`,
    accent: relic.accent,
  };

  const fusions = fusionCandidates(spells.levels, activeFusions);
  if (fusions.length > 0) {
    const fusionIndex = Math.min(fusions.length - 1, Math.max(0, Math.floor(rng() * fusions.length)));
    const fusionId = fusions[fusionIndex]!;
    const fusion = fusionDefinition(fusionId);
    const fusionChoice: FusionRewardChoice = {
      kind: 'fusion',
      id: `fusion:${fusionId}`,
      fusionId,
      title: `마법 융합 · ${fusionHeroName(fusionId, heroId)}`,
      description: `${fusion.description} · 런당 최대 2개`,
      accent: heroSpellIdentity(heroId, fusion.components[0]).primary,
    };
    return [upgrades[0]!, relicChoice, fusionChoice];
  }

  return [upgrades[0]!, upgrades[1]!, relicChoice];
}
