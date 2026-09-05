import { buildRecoveryGuidance } from './build-recovery-guidance.js';
function cleanLabel(label) { return label.replace(/^RECOVER\s*·\s*/, ''); }
export function secondBossBuildGoal(input) {
    const elapsed = Number.isFinite(input.elapsedSeconds) ? Math.max(0, input.elapsedSeconds) : 0;
    if (elapsed < 1800 || elapsed > 3600 || Math.max(0, Math.floor(input.bossesKilled)) < 2)
        return null;
    const guidance = buildRecoveryGuidance(input);
    if (!guidance)
        return { kind: 'complete', label: '다음 목표 · 완성 빌드 유지', detail: '교체보다 현재 강점 강화', newActionCount: 0 };
    return { kind: guidance.kind, label: `다음 목표 · ${cleanLabel(guidance.label)}`, detail: guidance.detail, newActionCount: 0 };
}
