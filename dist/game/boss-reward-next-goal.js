import { buildRecoveryGuidance } from './build-recovery-guidance.js';
function cleanLabel(label) { return label.replace(/^RECOVER\s*·\s*/, ''); }
export function bossRewardNextGoal(input) {
    const elapsed = Number.isFinite(input.elapsedSeconds) ? Math.max(0, input.elapsedSeconds) : 0;
    if (elapsed < 540 || elapsed > 1800)
        return null;
    const guidance = buildRecoveryGuidance({ ...input, elapsedSeconds: Math.max(600, elapsed) });
    if (!guidance)
        return null;
    return { kind: guidance.kind, label: `다음 목표 · ${cleanLabel(guidance.label)}`, detail: guidance.detail, newActionCount: 0 };
}
