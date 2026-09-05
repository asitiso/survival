import { clamp } from '../../core/math.js';
function band(seconds) {
    if (seconds < 7200)
        return { base: 1, target: 0 };
    if (seconds < 14400)
        return { base: 1.04, target: 500 };
    if (seconds < 28800)
        return { base: 1.06, target: 650 };
    return { base: 1.08, target: 800 };
}
export function longRunRewardDensityPolicy(elapsedSeconds, recentGoldPerMinute) {
    const seconds = Math.max(0, Number.isFinite(elapsedSeconds) ? elapsedSeconds : 0);
    const recent = Math.max(0, Number.isFinite(recentGoldPerMinute) ? recentGoldPerMinute : 0);
    const selected = band(seconds);
    if (selected.base === 1)
        return { goldMultiplier: 1, xpMultiplier: 1, baseMultiplier: 1, targetGoldPerMinute: 0, damping: 1 };
    const low = selected.target * .9;
    const high = selected.target * 1.5;
    const damping = recent <= low ? 1 : recent >= high ? 0 : clamp((high - recent) / Math.max(1, high - low), 0, 1);
    const goldMultiplier = 1 + (selected.base - 1) * damping;
    const xpMultiplier = 1 + (selected.base - 1) * .75 * damping;
    return {
        goldMultiplier: Math.round(clamp(goldMultiplier, 1, 1.08) * 1000) / 1000,
        xpMultiplier: Math.round(clamp(xpMultiplier, 1, 1.08) * 1000) / 1000,
        baseMultiplier: selected.base,
        targetGoldPerMinute: selected.target,
        damping: Math.round(damping * 1000) / 1000,
    };
}
export function auditLongRunRewardDensity() {
    const checkpoints = [120, 240, 480, 720].map((minute) => {
        const target = band(minute * 60).target;
        const policy = longRunRewardDensityPolicy(minute * 60, target * .8);
        return { minute, goldMultiplier: policy.goldMultiplier, xpMultiplier: policy.xpMultiplier, targetGoldPerMinute: policy.targetGoldPerMinute };
    });
    const noDrought = checkpoints.every((point) => point.goldMultiplier > 1 && point.xpMultiplier > 1);
    const noInflation = checkpoints.every((point) => point.goldMultiplier <= 1.08 && point.xpMultiplier <= 1.08) && longRunRewardDensityPolicy(43200, 5000).goldMultiplier === 1;
    return { checkpoints, noDrought, noInflation, passed: noDrought && noInflation };
}
export function auditLongRunEconomy() {
    const minutes = [120, 180, 240, 360, 480, 600, 720];
    const scenarios = ['drought', 'healthy', 'saturated'];
    const checkpoints = [];
    for (const minute of minutes) {
        const target = band(minute * 60).target;
        for (const scenario of scenarios) {
            const recent = scenario === 'drought' ? target * .55 : scenario === 'healthy' ? target * 1.05 : target * 1.7;
            const policy = longRunRewardDensityPolicy(minute * 60, recent);
            checkpoints.push({ minute, scenario, recentGoldPerMinute: Math.round(recent * 10) / 10, goldMultiplier: policy.goldMultiplier, xpMultiplier: policy.xpMultiplier });
        }
    }
    const bounded = checkpoints.every((point) => point.goldMultiplier >= 1 && point.goldMultiplier <= 1.08 && point.xpMultiplier >= 1 && point.xpMultiplier <= 1.08);
    const saturatedNeutral = checkpoints.filter((point) => point.scenario === 'saturated').every((point) => point.goldMultiplier === 1 && point.xpMultiplier === 1);
    const xpBalanced = checkpoints.every((point) => point.xpMultiplier <= point.goldMultiplier + 1e-9);
    const drought = checkpoints.filter((point) => point.scenario === 'drought').sort((a, b) => a.minute - b.minute);
    let maxAdjacentGoldDelta = 0, maxAdjacentXpDelta = 0;
    for (let i = 1; i < drought.length; i++) {
        maxAdjacentGoldDelta = Math.max(maxAdjacentGoldDelta, Math.abs(drought[i].goldMultiplier - drought[i - 1].goldMultiplier));
        maxAdjacentXpDelta = Math.max(maxAdjacentXpDelta, Math.abs(drought[i].xpMultiplier - drought[i - 1].xpMultiplier));
    }
    maxAdjacentGoldDelta = Math.round(maxAdjacentGoldDelta * 1000) / 1000;
    maxAdjacentXpDelta = Math.round(maxAdjacentXpDelta * 1000) / 1000;
    const noLateSpike = maxAdjacentGoldDelta <= .02 && maxAdjacentXpDelta <= .02;
    return { minutes, checkpoints, bounded, saturatedNeutral, xpBalanced, noLateSpike, maxAdjacentGoldDelta, maxAdjacentXpDelta, passed: bounded && saturatedNeutral && xpBalanced && noLateSpike };
}
