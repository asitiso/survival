export function ascensionMutatorRuntimeModifiers(mutators) {
    const active = new Set(mutators);
    return {
        projectileSpeedMultiplier: active.has('accelerated_projectiles') ? 1.16 : 1,
        eliteHealthMultiplier: active.has('reinforced_elites') ? 1.28 : 1,
        shopIntervalMultiplier: active.has('scarce_shop') ? 1.18 : 1,
        volatileDeath: active.has('volatile_death')
            ? { enabled: true, radius: 108, damage: 64 }
            : { enabled: false, radius: 0, damage: 0 },
    };
}
