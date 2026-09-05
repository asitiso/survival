import { clamp } from '../core/math.js';
const NEUTRAL = { stage: null, label: '', telegraphRadius: 0, vignetteAlpha: 0, pulse: 1, soundKind: null };
export function openingBossEntrance(elapsedSeconds) {
    const s = Math.max(0, Number.isFinite(elapsedSeconds) ? elapsedSeconds : 0);
    if (s < 524 || s >= 552)
        return NEUTRAL;
    if (s < 535) {
        const t = clamp((s - 524) / 11, 0, 1);
        return { stage: 'anticipation', label: 'BOSS SIGNAL', telegraphRadius: 90 + 45 * t, vignetteAlpha: .08 + .08 * t, pulse: 1 + .05 * t, soundKind: null };
    }
    if (s < 543) {
        const t = clamp((s - 535) / 8, 0, 1);
        return { stage: 'arrival', label: 'BOSS BREACH', telegraphRadius: 145 + 70 * t, vignetteAlpha: .2 + .12 * t, pulse: 1.1 + .08 * t, soundKind: 'bossSpawn' };
    }
    const t = clamp((s - 543) / 9, 0, 1);
    return { stage: 'release', label: 'ENGAGE', telegraphRadius: 210 - 65 * t, vignetteAlpha: .18 * (1 - t), pulse: 1.12 - .12 * t, soundKind: 'bossPhase' };
}
