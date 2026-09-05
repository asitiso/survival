import { auditBuildCompletionSpeed, buildCompletionSpeedSamples } from './build-completion-speed-audit.js';
function round(value) { return Math.round(value * 1000) / 1000; }
export function auditMidgameBuildVelocity() {
    const all = buildCompletionSpeedSamples();
    const samples = all.filter((sample) => sample.minute === 15 || sample.minute === 20 || sample.minute === 25);
    const keys = new Set(samples.map((sample) => `${sample.heroId}|${sample.archetype}|${sample.threat}`));
    let minFifteenToTwentyGain = 1, minTwentyMinuteProgress = 1;
    for (const key of keys) {
        const group = samples.filter((sample) => `${sample.heroId}|${sample.archetype}|${sample.threat}` === key);
        const at15 = group.find((sample) => sample.minute === 15)?.completionProgress ?? 0;
        const at20 = group.find((sample) => sample.minute === 20)?.completionProgress ?? 0;
        minFifteenToTwentyGain = Math.min(minFifteenToTwentyGain, Math.max(0, at20 - at15));
        minTwentyMinuteProgress = Math.min(minTwentyMinuteProgress, at20);
    }
    const completion = auditBuildCompletionSpeed();
    const maxCompletionMinute = completion.maxCompletionMinute;
    const threatParity = completion.threatParity;
    minFifteenToTwentyGain = round(minFifteenToTwentyGain);
    minTwentyMinuteProgress = round(minTwentyMinuteProgress);
    const passed = keys.size === 48 && samples.length === 144 && minFifteenToTwentyGain >= .08 && minTwentyMinuteProgress >= .85 && maxCompletionMinute <= 25 && threatParity;
    return { samples: samples.length, combinations: keys.size, minFifteenToTwentyGain, minTwentyMinuteProgress, maxCompletionMinute, threatParity, actionCount: 9, snapshotMutation: false, passed };
}
