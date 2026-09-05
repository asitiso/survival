import type { HeroMeterModifiers } from './hero-meters.js';

export interface HeroMeterCombatBase {
  spellPowerMultiplier: number;
  cooldownMultiplier: number;
  areaMultiplier: number;
  coreDamageTakenMultiplier: number;
  arkanExplosionChanceBonus: number;
  arkanExplosionRadiusMultiplier: number;
}

export function composeHeroMeterCombat<T extends HeroMeterCombatBase>(base: T, meter: HeroMeterModifiers): T {
  if (
    meter.spellPowerMultiplier === 1 && meter.cooldownMultiplier === 1 && meter.areaMultiplier === 1 &&
    meter.coreDamageTakenMultiplier === 1 && meter.arkanExplosionChanceBonus === 0 && meter.arkanExplosionRadiusMultiplier === 1
  ) return base;
  return {
    ...base,
    spellPowerMultiplier: base.spellPowerMultiplier * meter.spellPowerMultiplier,
    cooldownMultiplier: base.cooldownMultiplier * meter.cooldownMultiplier,
    areaMultiplier: base.areaMultiplier * meter.areaMultiplier,
    coreDamageTakenMultiplier: base.coreDamageTakenMultiplier * meter.coreDamageTakenMultiplier,
    arkanExplosionChanceBonus: base.arkanExplosionChanceBonus + meter.arkanExplosionChanceBonus,
    arkanExplosionRadiusMultiplier: base.arkanExplosionRadiusMultiplier * meter.arkanExplosionRadiusMultiplier,
  };
}

import type { ActionId } from './config.js';
import type { HeroId } from './hero-profiles.js';
import type { HeroMeterSignals } from './hero-meters.js';

export function heroMeterCastSignals(heroId: HeroId, action: ActionId): HeroMeterSignals {
  if (heroId === 'arkan') return { casts: 1 };
  if (heroId === 'seria') {
    if (action === 'spell3') return { chilledHits: 5 };
    if (action === 'spell4') return { chilledHits: 3 };
    if (action === 'ultimate1' || action === 'ultimate2') return { chilledHits: 6 };
    return { chilledHits: 1 };
  }
  if (heroId === 'kain') return { casts: 1 };
  return {};
}

export function heroMeterKillSignals(heroId: HeroId, death: { wasSlowed?: boolean | undefined }): HeroMeterSignals {
  if (heroId === 'arkan') return { kills: 1 };
  if (heroId === 'seria' && death.wasSlowed) return { frozenKills: 1 };
  return {};
}
