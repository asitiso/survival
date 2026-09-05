export function deepRunHudFocus(input) {
    const elapsed = Number.isFinite(input.elapsedSeconds) ? Math.max(0, input.elapsedSeconds) : 0;
    if (elapsed < 3600 || elapsed > 7200)
        return { tier: 0, completionSignals: 0, maxBuildLabels: 4, keepCriticalBars: true, dangerTelegraphMultiplier: 1 };
    let signals = 0;
    if ((input.equipment.weapon?.rank ?? 0) >= 5)
        signals++;
    if ((input.equipment.armor?.rank ?? 0) >= 5)
        signals++;
    if (input.activeRelic)
        signals++;
    if (Math.max(0, Math.floor(input.activeFusionCount)) >= 2)
        signals++;
    if (signals >= 4)
        return { tier: 2, completionSignals: signals, maxBuildLabels: 1, keepCriticalBars: true, dangerTelegraphMultiplier: 1 };
    if (signals >= 3)
        return { tier: 1, completionSignals: signals, maxBuildLabels: 2, keepCriticalBars: true, dangerTelegraphMultiplier: 1 };
    return { tier: 0, completionSignals: signals, maxBuildLabels: 4, keepCriticalBars: true, dangerTelegraphMultiplier: 1 };
}
