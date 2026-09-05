import { clamp } from '../core/math.js';
export function foldableDensityPolicy(safe, context) {
    const requested = clamp(Math.floor(Number.isFinite(context.maxBuildLabels) ? context.maxBuildLabels : 4), 1, 4);
    if (safe.aspectClass !== 'foldable')
        return {
            foldable: false,
            statusMaxChars: safe.statusMaxChars,
            maxBuildLabels: requested,
            showHpNumbers: true,
            showXpBar: true,
            showMeterBar: true,
            showXpNumbers: true,
            showMeterText: true,
        };
    const longRun = Math.max(0, Math.floor(Number.isFinite(context.longRunTier) ? context.longRunTier : 0));
    let statusMaxChars = Math.min(safe.statusMaxChars, 32);
    let maxBuildLabels = Math.min(requested, 3);
    let showXpNumbers = true;
    let showMeterText = true;
    if (context.bossActive) {
        statusMaxChars = Math.min(statusMaxChars, 28);
        maxBuildLabels = Math.min(maxBuildLabels, 2);
        showXpNumbers = false;
    }
    if (context.mythicActive) {
        statusMaxChars = Math.min(statusMaxChars, 24);
        maxBuildLabels = 1;
        showXpNumbers = false;
        showMeterText = false;
    }
    if (longRun >= 3) {
        statusMaxChars = Math.max(20, statusMaxChars - 4);
        maxBuildLabels = Math.max(1, Math.min(maxBuildLabels, 2));
    }
    return { foldable: true, statusMaxChars, maxBuildLabels, showHpNumbers: true, showXpBar: true, showMeterBar: true, showXpNumbers, showMeterText };
}
