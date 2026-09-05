export function composeThreatPressure(base, threat) {
    return {
        enemySpeedMultiplier: base.enemySpeedMultiplier * threat.enemySpeedMultiplier,
        spawnPressureMultiplier: base.spawnPressureMultiplier * threat.spawnPressureMultiplier,
        eliteIntervalMultiplier: base.eliteIntervalMultiplier * threat.eliteIntervalMultiplier,
        ...(base.regularWeights ? { regularWeights: base.regularWeights } : {}),
        bossVariantBonus: threat.bossVariantBonus,
    };
}
