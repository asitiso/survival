export function clampThreatLevel(value) {
    return Math.max(0, Math.min(5, Math.floor(Number.isFinite(value) ? value : 0)));
}
export function threatLevelName(value) {
    const level = clampThreatLevel(value);
    return ['안정', '긴장', '위험', '악몽', '재앙', '종말'][level];
}
export function threatLevelModifiers(value) {
    const level = clampThreatLevel(value);
    return {
        spawnPressureMultiplier: 1 + level * 0.10,
        eliteIntervalMultiplier: Math.max(0.48, 1 - level * 0.085),
        enemySpeedMultiplier: 1 + level * 0.035,
        bossVariantBonus: (level >= 5 ? 2 : level >= 3 ? 1 : 0),
        shardMultiplier: 1 + level * 0.17,
    };
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
