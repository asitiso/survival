const THREAT_TABLE = [
    { spawnPressureMultiplier: .80, eliteIntervalMultiplier: 1.18, enemySpeedMultiplier: .94, projectileSpeedMultiplier: .88, bossSpecialCadenceMultiplier: 1.14, bossVariantBonus: 0, shardMultiplier: 1.00 },
    { spawnPressureMultiplier: .90, eliteIntervalMultiplier: 1.08, enemySpeedMultiplier: .97, projectileSpeedMultiplier: .94, bossSpecialCadenceMultiplier: 1.07, bossVariantBonus: 0, shardMultiplier: 1.17 },
    { spawnPressureMultiplier: 1.00, eliteIntervalMultiplier: 1.00, enemySpeedMultiplier: 1.00, projectileSpeedMultiplier: 1.00, bossSpecialCadenceMultiplier: 1.00, bossVariantBonus: 0, shardMultiplier: 1.34 },
    { spawnPressureMultiplier: 1.13, eliteIntervalMultiplier: .90, enemySpeedMultiplier: 1.035, projectileSpeedMultiplier: 1.06, bossSpecialCadenceMultiplier: .94, bossVariantBonus: 1, shardMultiplier: 1.51 },
    { spawnPressureMultiplier: 1.29, eliteIntervalMultiplier: .78, enemySpeedMultiplier: 1.07, projectileSpeedMultiplier: 1.13, bossSpecialCadenceMultiplier: .86, bossVariantBonus: 1, shardMultiplier: 1.68 },
    { spawnPressureMultiplier: 1.48, eliteIntervalMultiplier: .66, enemySpeedMultiplier: 1.11, projectileSpeedMultiplier: 1.22, bossSpecialCadenceMultiplier: .78, bossVariantBonus: 2, shardMultiplier: 1.85 },
];
export function clampThreatLevel(value) {
    return Math.max(0, Math.min(5, Math.floor(Number.isFinite(value) ? value : 0)));
}
export function threatLevelName(value) {
    const level = clampThreatLevel(value);
    return ['안정', '긴장', '위험', '악몽', '재앙', '종말'][level];
}
export function threatLevelModifiers(value) {
    return { ...THREAT_TABLE[clampThreatLevel(value)] };
}
export function threatUnlockAfterRun(currentUnlocked, run) {
    const current = clampThreatLevel(currentUnlocked);
    if (current >= 5)
        return 5;
    const requiredSeconds = 540 + current * 120;
    const requiredBosses = Math.max(1, current + 1);
    if (Math.max(0, run.seconds) < requiredSeconds || Math.max(0, Math.floor(run.bosses)) < requiredBosses)
        return current;
    return clampThreatLevel(current + 1);
}
