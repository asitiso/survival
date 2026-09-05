import { clamp } from '../../core/math.js';
export function flowFeedbackProfile(streak, family, tier) {
    const s = clamp(Math.floor(Number.isFinite(streak) ? streak : 0), 0, 5), ratio = s / 5;
    const tierFactor = tier === 'full' ? 1 : tier === 'reduced' ? .72 : .46;
    const familyFactor = family === 'surge' ? 1.08 : family === 'flow' ? 1 : family === 'drift' ? .94 : .9;
    return {
        auraAlpha: clamp(.16 + .28 * ratio, .16, .46),
        auraRadius: clamp(28 + 22 * ratio * familyFactor, 28, 54),
        trailSegments: Math.max(1, Math.min(10, Math.round((2 + 8 * ratio) * tierFactor))),
        trailLength: clamp((22 + 34 * ratio) * tierFactor, 12, 56),
        pulseRadius: clamp(30 + 34 * ratio, 30, 64),
        lineWidth: clamp(2 + 2.5 * ratio, 2, 4.5),
    };
}
export function shouldEmitFlowCue(previousStreak, nextStreak) {
    const prev = Math.max(0, Math.floor(previousStreak)), next = Math.max(0, Math.floor(nextStreak));
    return (prev < 2 && next >= 2) || (prev < 4 && next >= 4) || (prev < 5 && next >= 5);
}
export function flowImpactProfile(previousStreak, nextStreak, family, tier) {
    if (!shouldEmitFlowCue(previousStreak, nextStreak))
        return null;
    const next = Math.max(0, Math.min(5, Math.floor(nextStreak)));
    const level = next >= 5 ? 3 : next >= 4 ? 2 : 1;
    const familyFactor = family === 'surge' ? 1.08 : family === 'anchor' ? 1.04 : family === 'drift' ? .98 : 1;
    const tierFactor = tier === 'full' ? 1 : tier === 'reduced' ? .68 : .42;
    return {
        freezeMs: Math.round(clamp((18 + level * 10) * familyFactor, 20, 55)),
        shake: clamp((.8 + level * .85) * familyFactor, .8, 4),
        particleCount: Math.max(2, Math.min(12, Math.round((3 + level * 3) * tierFactor))),
        ringRadius: clamp(34 + level * 12, 34, 72),
        soundKind: 'flowImpact',
    };
}
