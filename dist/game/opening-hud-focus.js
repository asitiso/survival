export function openingHudFocusPolicy(elapsedSeconds) {
    const s = Math.max(0, Number.isFinite(elapsedSeconds) ? elapsedSeconds : 0);
    if (s < 120)
        return { active: true, maxBuildLabels: 1, maxTacticalRows: 2, keepCriticalBars: true };
    if (s < 300)
        return { active: true, maxBuildLabels: 2, maxTacticalRows: 2, keepCriticalBars: true };
    if (s < 600)
        return { active: true, maxBuildLabels: 3, maxTacticalRows: 3, keepCriticalBars: true };
    return { active: false, maxBuildLabels: 4, maxTacticalRows: 4, keepCriticalBars: true };
}
