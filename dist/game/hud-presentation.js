export function spellButtonPresentation(cooldownRemaining, isUltimate, wasReady, autoEnabled) {
    const remaining = Math.max(0, cooldownRemaining);
    const ready = remaining <= 0.05;
    return {
        ready,
        secondary: ready ? 'READY' : remaining.toFixed(remaining < 10 ? 1 : 0),
        pulse: isUltimate && ready && !wasReady,
        autoLabel: autoEnabled ? 'AUTO ON' : 'AUTO',
        ringAlpha: ready ? (isUltimate ? 0.95 : 0.72) : 0.34,
    };
}
export function compactBuildLabels(relicName, synergies) {
    const rows = [];
    if (relicName)
        rows.push(`유물 · ${relicName}`);
    const visible = synergies.filter(Boolean).slice(0, 2);
    if (visible.length > 0)
        rows.push(`시너지 · ${visible.join(' / ')}`);
    return rows.slice(0, 2);
}
export function compactPhase22BuildLabels(input) {
    const mastery = Math.max(1, Math.min(20, Math.floor(Number.isFinite(input.masteryLevel) ? input.masteryLevel : 1)));
    const rows = [];
    rows.push(`M${mastery}${input.relicName ? ` · 유물 ${input.relicName}` : ''}`);
    const fusions = input.fusionNames.filter(Boolean).slice(0, 2);
    if (fusions.length > 0)
        rows.push(`융합 · ${fusions.join(' / ')}`);
    const synergies = input.synergies.filter(Boolean).slice(0, 2);
    if (synergies.length > 0)
        rows.push(`시너지 · ${synergies.join(' / ')}`);
    if (input.fateSummary.trim())
        rows.push(`운명 · ${input.fateSummary.trim()}`);
    return rows.slice(0, 4);
}
export function actionCuePresentation(input) {
    const reducedMotion = input.reducedMotion ?? input.reducedFlash;
    if (input.assistActive) {
        const animated = !input.queued && !reducedMotion;
        return {
            outerCue: 'assist',
            animated,
            showAssistLabel: !input.queued,
            clearReadyPulse: true,
            motionAmplitude: animated ? 0.05 : 0,
        };
    }
    if (input.readyPulseRequested || input.readyPulseActive) {
        const animated = !reducedMotion;
        return {
            outerCue: 'ready',
            animated,
            showAssistLabel: false,
            clearReadyPulse: false,
            motionAmplitude: animated ? 0.06 : 0,
        };
    }
    return { outerCue: null, animated: false, showAssistLabel: false, clearReadyPulse: false, motionAmplitude: 0 };
}
