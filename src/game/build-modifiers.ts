import type { EquipmentState } from '../domain/types.js';
import type { LegendaryRuntimeModifiers } from './legendary-effects.js';
import type { HeroId } from './hero-profiles.js';
import { relicModifiers, type RelicId } from './relics.js';
import type { RunTraitId } from './run-traits.js';
import { equipmentBonuses } from './shop-data.js';
import { synergyModifiers } from './synergies.js';

export interface CombatBuildInput {
  heroId: HeroId;
  traitId: RunTraitId | null;
  relicId: RelicId | null;
  equipment: EquipmentState;
  legendaryRuntime: LegendaryRuntimeModifiers;
}

export interface CombatBuildModifiers {
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

export function composeCombatBuild(input: CombatBuildInput): CombatBuildModifiers {
  const equipment = equipmentBonuses(input.equipment);
  const relic = relicModifiers(input.relicId, input.heroId);
  const synergy = synergyModifiers({
    heroId: input.heroId,
    traitId: input.traitId,
    relicId: input.relicId,
    equipment: input.equipment,
  });
  const runtime = input.legendaryRuntime;
  return {
    spellPowerMultiplier: equipment.spellPowerMultiplier * relic.spellPowerMultiplier * synergy.spellPowerMultiplier * runtime.spellPowerMultiplier,
    cooldownMultiplier: equipment.cooldownMultiplier * relic.cooldownMultiplier * synergy.cooldownMultiplier * runtime.cooldownMultiplier,
    moveSpeedMultiplier: equipment.moveSpeedMultiplier * relic.moveSpeedMultiplier * synergy.moveSpeedMultiplier * runtime.moveSpeedMultiplier,
    heroDamageTakenMultiplier: equipment.damageTakenMultiplier * relic.heroDamageTakenMultiplier * synergy.heroDamageTakenMultiplier * runtime.heroDamageTakenMultiplier,
    areaMultiplier: equipment.areaMultiplier * relic.areaMultiplier * synergy.areaMultiplier,
    goldMultiplier: equipment.goldMultiplier * relic.goldMultiplier * synergy.goldMultiplier,
    pickupMultiplier: equipment.pickupMultiplier * relic.pickupMultiplier,
    coreDamageTakenMultiplier: equipment.coreDamageTakenMultiplier * relic.coreDamageTakenMultiplier * synergy.coreDamageTakenMultiplier * runtime.coreDamageTakenMultiplier,
    arkanExplosionChanceBonus: relic.arkanExplosionChanceBonus + synergy.arkanExplosionChanceBonus,
    arkanExplosionRadiusMultiplier: relic.arkanExplosionRadiusMultiplier * synergy.arkanExplosionRadiusMultiplier,
    kainOverloadGainMultiplier: relic.kainOverloadGainMultiplier * synergy.kainOverloadGainMultiplier,
    kainOverloadMaxCooldownReduction: Math.min(0.45, relic.kainOverloadMaxCooldownReduction + synergy.kainOverloadMaxCooldownReductionBonus),
    edricAuraRadiusBonus: relic.edricAuraRadiusBonus + synergy.edricAuraRadiusBonus,
    edricHeroAuraMultiplier: relic.edricHeroAuraMultiplier * synergy.edricAuraMitigationMultiplier,
    edricCoreAuraMultiplier: relic.edricCoreAuraMultiplier * synergy.edricAuraMitigationMultiplier,
  };
}

export interface ObjectiveCombatModifiers {
  spellPowerMultiplier: number;
  spawnPressureMultiplier: number;
}

export function composeObjectiveCombatModifiers(activePowerSeconds: number, cursedActive = false): ObjectiveCombatModifiers {
  return {
    spellPowerMultiplier: activePowerSeconds > 0 ? 1.18 : 1,
    spawnPressureMultiplier: cursedActive ? 1.35 : 1,
  };
}
