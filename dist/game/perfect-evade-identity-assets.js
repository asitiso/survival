import { clamp } from '../core/math.js';
export const PERFECT_EVADE_STREAKS = [1, 2, 3, 4, 5];
export const PERFECT_EVADE_IDENTITY_ATLAS = { src: './assets/ui/perfect-evade-icons.png', columns: 5, rows: 1, cellSize: 96, width: 480, height: 96 };
const ACCENTS = ['#a7edff', '#8fe5ff', '#78d7ff', '#9bc8ff', '#ffe69b'];
export function normalizedPerfectEvadeStreak(value) { return clamp(Math.floor(Number.isFinite(value) ? value : 1), 1, 5); }
export function perfectEvadeIdentityIcon(value) { const streak = normalizedPerfectEvadeStreak(value); return { streak, label: `PERFECT EVADE ×${streak}`, accent: ACCENTS[streak - 1], sx: (streak - 1) * 96, sy: 0, sw: 96, sh: 96, animated: false, motionAmplitude: 0, flowIdentitySupported: true, finisherReusesFinalFormIdentity: streak === 5, textFallbackPreserved: true, loadFailureBlocksGameplay: false }; }
export function auditPerfectEvadeIdentityAtlas() { const cells = new Set(), outOfBounds = []; for (const streak of PERFECT_EVADE_STREAKS) {
    const icon = perfectEvadeIdentityIcon(streak);
    cells.add(`${icon.sx / 96}:0`);
    if (icon.sx < 0 || icon.sx + 96 > 480)
        outOfBounds.push(streak);
} const coverage = PERFECT_EVADE_STREAKS.length / 5; return { itemCount: PERFECT_EVADE_STREAKS.length, coverage, uniqueCellCount: cells.size, outOfBounds, passed: coverage === 1 && cells.size === 5 && outOfBounds.length === 0 }; }
