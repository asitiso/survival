export function longRunComfortPolicy(elapsedSeconds) {
    const s = Math.max(0, Number.isFinite(elapsedSeconds) ? elapsedSeconds : 0);
    if (s >= 8 * 3600)
        return { tier: 3, vfxDensity: .66, maxBuildLabels: 2, notificationCadenceMultiplier: 1.75, dangerTelegraphMultiplier: 1, enemyPressureMultiplier: 1 };
    if (s >= 4 * 3600)
        return { tier: 2, vfxDensity: .76, maxBuildLabels: 3, notificationCadenceMultiplier: 1.45, dangerTelegraphMultiplier: 1, enemyPressureMultiplier: 1 };
    if (s >= 2 * 3600)
        return { tier: 1, vfxDensity: .9, maxBuildLabels: 3, notificationCadenceMultiplier: 1.2, dangerTelegraphMultiplier: 1, enemyPressureMultiplier: 1 };
    return { tier: 0, vfxDensity: 1, maxBuildLabels: 4, notificationCadenceMultiplier: 1, dangerTelegraphMultiplier: 1, enemyPressureMultiplier: 1 };
}
