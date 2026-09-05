import { relicModifiers } from './relics.js';
import { equipmentBonuses } from './shop-data.js';
import { synergyModifiers } from './synergies.js';
export function composeCombatBuild(input) {
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
export function composeObjectiveCombatModifiers(activePowerSeconds, cursedActive = false) {
    return {
        spellPowerMultiplier: activePowerSeconds > 0 ? 1.18 : 1,
        spawnPressureMultiplier: cursedActive ? 1.35 : 1,
    };
}
