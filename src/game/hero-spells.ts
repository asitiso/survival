import type { ActionId } from './config.js';
import type { HeroId } from './hero-profiles.js';
import type { SpellId } from './spells.js';

export interface HeroSpellIdentity {
  primary: string;
  secondary: string;
  damageMultiplier: number;
  areaMultiplier: number;
  projectileSpeedMultiplier: number;
  pierceBonus: number;
  splashRadius: number;
  splashDamageMultiplier: number;
  projectileSlowFactor: number;
  projectileSlowDuration: number;
  chainJumpBonus: number;
  chainSlowFactor: number;
  chainSlowDuration: number;
  novaDamageMultiplier: number;
  knockback: number;
  fieldDamageMultiplier: number;
  fieldSlowFactor: number;
  fieldSlowDuration: number;
  fieldTickMultiplier: number;
  fieldAtCore: boolean;
  meteorDamageMultiplier: number;
  meteorDelayMultiplier: number;
  meteorSlowFactor: number;
  meteorSlowDuration: number;
  holeDamageMultiplier: number;
  holeSlowFactor: number;
  holeSlowDuration: number;
  holeTickMultiplier: number;
}

const BASE: HeroSpellIdentity = {
  primary: '#ffd071', secondary: '#ff6d38', damageMultiplier: 1, areaMultiplier: 1,
  projectileSpeedMultiplier: 1, pierceBonus: 0, splashRadius: 0, splashDamageMultiplier: 0,
  projectileSlowFactor: 1, projectileSlowDuration: 0, chainJumpBonus: 0, chainSlowFactor: 1, chainSlowDuration: 0,
  novaDamageMultiplier: 1, knockback: 0, fieldDamageMultiplier: 1, fieldSlowFactor: 1, fieldSlowDuration: 0,
  fieldTickMultiplier: 1, fieldAtCore: false, meteorDamageMultiplier: 1, meteorDelayMultiplier: 1,
  meteorSlowFactor: 1, meteorSlowDuration: 0, holeDamageMultiplier: 1, holeSlowFactor: 1, holeSlowDuration: 0,
  holeTickMultiplier: 1,
};

const HERO_COLORS: Record<HeroId, Pick<HeroSpellIdentity, 'primary' | 'secondary'>> = {
  arkan: { primary: '#ffd071', secondary: '#ff5a38' },
  seria: { primary: '#c9f4ff', secondary: '#55cfff' },
  kain: { primary: '#e2d2ff', secondary: '#9b72ff' },
  edric: { primary: '#fff1ad', secondary: '#e8bd55' },
};

export function heroSpellIdentity(heroId: HeroId, spellId: SpellId): HeroSpellIdentity {
  const identity: HeroSpellIdentity = { ...BASE, ...HERO_COLORS[heroId] };

  if (heroId === 'arkan') {
    if (spellId === 'fireBolt') return { ...identity, damageMultiplier: 1.08, splashRadius: 44, splashDamageMultiplier: 0.42 };
    if (spellId === 'chainLightning') return { ...identity, damageMultiplier: 1.10 };
    if (spellId === 'frostNova') return { ...identity, novaDamageMultiplier: 1.22, areaMultiplier: 1.06 };
    if (spellId === 'flameField') return { ...identity, fieldDamageMultiplier: 1.22, areaMultiplier: 1.08 };
    if (spellId === 'meteorStorm') return { ...identity, meteorDamageMultiplier: 1.18, areaMultiplier: 1.08 };
    return { ...identity, holeDamageMultiplier: 1.18 };
  }

  if (heroId === 'seria') {
    if (spellId === 'fireBolt') return { ...identity, projectileSlowFactor: 0.70, projectileSlowDuration: 1.25 };
    if (spellId === 'chainLightning') return { ...identity, chainSlowFactor: 0.66, chainSlowDuration: 1.15, chainJumpBonus: 1 };
    if (spellId === 'frostNova') return { ...identity, novaDamageMultiplier: 1.20, areaMultiplier: 1.10 };
    if (spellId === 'flameField') return { ...identity, fieldSlowFactor: 0.62, fieldSlowDuration: 0.55, areaMultiplier: 1.08 };
    if (spellId === 'meteorStorm') return { ...identity, meteorSlowFactor: 0.58, meteorSlowDuration: 2.4, meteorDelayMultiplier: 0.92 };
    return { ...identity, holeSlowFactor: 0.48, holeSlowDuration: 0.55, areaMultiplier: 1.08 };
  }

  if (heroId === 'kain') {
    if (spellId === 'fireBolt') return { ...identity, projectileSpeedMultiplier: 1.35, pierceBonus: 1 };
    if (spellId === 'chainLightning') return { ...identity, chainJumpBonus: 2, damageMultiplier: 1.04 };
    if (spellId === 'frostNova') return { ...identity, areaMultiplier: 0.92, novaDamageMultiplier: 1.10 };
    if (spellId === 'flameField') return { ...identity, fieldTickMultiplier: 1.35, fieldDamageMultiplier: 0.92 };
    if (spellId === 'meteorStorm') return { ...identity, meteorDelayMultiplier: 0.68, meteorDamageMultiplier: 0.92 };
    return { ...identity, holeTickMultiplier: 1.35, holeDamageMultiplier: 0.92 };
  }

  if (spellId === 'fireBolt') return { ...identity, pierceBonus: 2, projectileSpeedMultiplier: 1.06 };
  if (spellId === 'chainLightning') return { ...identity, chainJumpBonus: 1 };
  if (spellId === 'frostNova') return { ...identity, knockback: 82, areaMultiplier: 1.08 };
  if (spellId === 'flameField') return { ...identity, fieldAtCore: true, fieldSlowFactor: 0.76, fieldSlowDuration: 0.45, areaMultiplier: 1.10 };
  if (spellId === 'meteorStorm') return { ...identity, areaMultiplier: 1.12 };
  return { ...identity, areaMultiplier: 1.15, holeDamageMultiplier: 0.88 };
}

const LABELS: Record<HeroId, Record<Exclude<ActionId, 'potion' | 'shop' | 'auto'>, string>> = {
  arkan: { spell1: '화염탄', spell2: '폭염연쇄', spell3: '화염폭발', spell4: '용암지대', ultimate1: '메테오', ultimate2: '지옥와류' },
  seria: { spell1: '빙창', spell2: '서리연쇄', spell3: '동결폭발', spell4: '눈보라', ultimate1: '빙하폭격', ultimate2: '절대영도' },
  kain: { spell1: '뇌전탄', spell2: '체인번개', spell3: '전자폭발', spell4: '폭풍장', ultimate1: '천둥폭격', ultimate2: '폭풍의눈' },
  edric: { spell1: '성광창', spell2: '심판연쇄', spell3: '수호충격', spell4: '성역', ultimate1: '천상심판', ultimate2: '시간감옥' },
};

export function heroActionLabel(heroId: HeroId, actionId: ActionId): string {
  if (actionId === 'potion') return '물약';
  if (actionId === 'shop') return '상점';
  if (actionId === 'auto') return 'AUTO';
  return LABELS[heroId][actionId];
}


const SPELL_TO_ACTION: Record<SpellId, Exclude<ActionId, 'potion' | 'shop' | 'auto'>> = {
  fireBolt: 'spell1', chainLightning: 'spell2', frostNova: 'spell3', flameField: 'spell4', meteorStorm: 'ultimate1', blackHole: 'ultimate2',
};

export function heroSpellName(heroId: HeroId, spellId: SpellId): string {
  return heroActionLabel(heroId, SPELL_TO_ACTION[spellId]);
}
