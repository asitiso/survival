import type { MetaBonuses } from '../domain/meta-profile.js';
import type { RunTraitBonuses } from './run-traits.js';

export interface RunStartBaseStats {
  maxHp: number;
  spellPower: number;
  cooldownMultiplier: number;
  speed: number;
  pickupRadius: number;
}

export interface RunStartStats extends RunStartBaseStats {
  startingGold: number;
  goldMultiplier: number;
  heroDamageTakenMultiplier: number;
  coreDamageTakenMultiplier: number;
}

export function composeRunStartStats(base: RunStartBaseStats, meta: MetaBonuses, trait: RunTraitBonuses): RunStartStats {
  return {
    maxHp: Math.max(1, Math.round(base.maxHp * meta.maxHpMultiplier * trait.maxHpMultiplier)),
    spellPower: base.spellPower * meta.spellPowerMultiplier * trait.spellPowerMultiplier,
    cooldownMultiplier: base.cooldownMultiplier * trait.cooldownMultiplier,
    speed: base.speed * trait.moveSpeedMultiplier,
    pickupRadius: Math.max(1, Math.round(base.pickupRadius * meta.pickupRadiusMultiplier)),
    startingGold: Math.max(0, Math.floor(meta.startingGold)),
    goldMultiplier: trait.goldMultiplier,
    heroDamageTakenMultiplier: trait.heroDamageTakenMultiplier,
    coreDamageTakenMultiplier: trait.coreDamageTakenMultiplier,
  };
}
