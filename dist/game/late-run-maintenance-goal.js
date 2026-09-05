import { buildRecoveryGuidance } from './build-recovery-guidance.js';
function cleanLabel(label) { return label.replace(/^RECOVER\s*·\s*/, ''); }
export function lateRunMaintenanceGoal(input) {
    const elapsed = Number.isFinite(input.elapsedSeconds) ? Math.max(0, input.elapsedSeconds) : 0;
    if (elapsed < 3600 || elapsed > 7200 || Math.max(0, Math.floor(input.bossesKilled)) < 3)
        return null;
    const guidance = buildRecoveryGuidance(input);
    if (!guidance)
        return null;
    return { kind: guidance.kind, label: `정비 목표 · ${cleanLabel(guidance.label)}`, detail: guidance.detail, newActionCount: 0 };
}
