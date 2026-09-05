import type { HeroId } from './hero-profiles.js';

export interface HeroMeterState {
  heroId: HeroId;
  charge: number;
  activeTimer: number;
}

export interface HeroMeterSignals {
  moving?: boolean;
  casts?: number;
  kills?: number;
  chilledHits?: number;
  frozenKills?: number;
  preventedDamageRatio?: number;
}

export interface HeroMeterTransition {
  state: HeroMeterState;
  activated: boolean;
  releaseShockwave: boolean;
}

export interface HeroMeterModifiers {
  spellPowerMultiplier: number;
  cooldownMultiplier: number;
  areaMultiplier: number;
  coreDamageTakenMultiplier: number;
  arkanExplosionChanceBonus: number;
  arkanExplosionRadiusMultiplier: number;
  shatterRadius: number;
  shatterDamageMultiplier: number;
  kainChainBonus: number;
}

const DURATION: Record<HeroId, number> = { arkan: 7, seria: 6.5, kain: 5.5, edric: 6 };

function clamp01(value: number): number { return Math.max(0, Math.min(1, value)); }
function count(value: number | undefined): number { return Math.max(0, Number.isFinite(value) ? value ?? 0 : 0); }

export function createHeroMeterState(heroId: HeroId): HeroMeterState {
  return { heroId, charge: 0, activeTimer: 0 };
}

export function heroMeterLabel(heroId: HeroId): { name: string; activeName: string; color: string } {
  if (heroId === 'arkan') return { name: '열기', activeName: 'INFERNO', color: '#ff6d3f' };
  if (heroId === 'seria') return { name: '절대영도', activeName: 'ABSOLUTE ZERO', color: '#8fe7ff' };
  if (heroId === 'kain') return { name: '초과충전', activeName: 'SURGE', color: '#b79cff' };
  return { name: '심판력', activeName: 'JUDGMENT', color: '#ffd66f' };
}

export function updateHeroMeter(state: HeroMeterState, dt: number, signals: HeroMeterSignals = {}): HeroMeterTransition {
  const safeDt = Math.max(0, Number.isFinite(dt) ? dt : 0);
  let activeTimer = Math.max(0, state.activeTimer - safeDt);
  let charge = clamp01(state.charge);
  let gain = 0;

  if (activeTimer <= 0) {
    if (state.heroId === 'arkan') gain = count(signals.casts) * 0.055 + count(signals.kills) * 0.065;
    else if (state.heroId === 'seria') gain = count(signals.chilledHits) * 0.06 + count(signals.frozenKills) * 0.18;
    else if (state.heroId === 'kain') gain = (signals.moving ? safeDt * 0.12 : 0) + count(signals.casts) * 0.055;
    else gain = count(signals.preventedDamageRatio) * 1.8;

    const passiveDrain = state.heroId === 'kain' && !signals.moving ? safeDt * 0.025 : 0;
    charge = clamp01(charge + gain - passiveDrain);
  }

  let activated = false;
  if (activeTimer <= 0 && charge >= 0.999) {
    activeTimer = DURATION[state.heroId];
    charge = 0;
    activated = true;
  }

  return {
    state: { heroId: state.heroId, charge, activeTimer },
    activated,
    releaseShockwave: activated && state.heroId === 'edric',
  };
}

export function heroMeterModifiers(state: HeroMeterState): HeroMeterModifiers {
  const active = state.activeTimer > 0;
  const base: HeroMeterModifiers = {
    spellPowerMultiplier: 1,
    cooldownMultiplier: 1,
    areaMultiplier: 1,
    coreDamageTakenMultiplier: 1,
    arkanExplosionChanceBonus: 0,
    arkanExplosionRadiusMultiplier: 1,
    shatterRadius: 0,
    shatterDamageMultiplier: 1,
    kainChainBonus: 0,
  };
  if (!active) return base;
  if (state.heroId === 'arkan') return { ...base, spellPowerMultiplier: 1.22, areaMultiplier: 1.15, arkanExplosionChanceBonus: 0.14, arkanExplosionRadiusMultiplier: 1.30 };
  if (state.heroId === 'seria') return { ...base, cooldownMultiplier: 0.88, areaMultiplier: 1.22, shatterRadius: 155, shatterDamageMultiplier: 1.35 };
  if (state.heroId === 'kain') return { ...base, cooldownMultiplier: 0.78, spellPowerMultiplier: 1.08, kainChainBonus: 2 };
  return { ...base, coreDamageTakenMultiplier: 0.72, areaMultiplier: 1.16 };
}
