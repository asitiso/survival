export function fourHourHudFocus(input) {
    const elapsed = Number.isFinite(input.elapsedSeconds) ? Math.max(0, input.elapsedSeconds) : 0;
    let signals = 0;
    if ((input.equipment.weapon?.rank ?? 0) >= 5)
        signals++;
    if ((input.equipment.armor?.rank ?? 0) >= 5)
        signals++;
    if (input.activeRelic)
        signals++;
    if (Math.max(0, Math.floor(input.activeFusionCount)) >= 2)
        signals++;
    if (elapsed < 7200)
        return { tier: 0, completionSignals: signals, maxBuildLabels: 4, showXpNumbers: true, showMeterText: true, statusMaxChars: 64, keepCriticalBars: true, keepDangerTelegraphs: true };
    const complete = signals >= 4;
    if (elapsed < 14400) {
        return { tier: 1, completionSignals: signals, maxBuildLabels: complete ? 1 : 2, showXpNumbers: false, showMeterText: !complete, statusMaxChars: input.mythicActive ? 38 : input.bossActive ? 42 : 46, keepCriticalBars: true, keepDangerTelegraphs: true };
    }
    return { tier: 2, completionSignals: signals, maxBuildLabels: complete ? 0 : 2, showXpNumbers: false, showMeterText: false, statusMaxChars: input.mythicActive ? 34 : input.bossActive ? 38 : 42, keepCriticalBars: true, keepDangerTelegraphs: true };
}
