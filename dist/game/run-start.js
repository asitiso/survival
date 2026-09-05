export function composeRunStartStats(base, meta, trait) {
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
