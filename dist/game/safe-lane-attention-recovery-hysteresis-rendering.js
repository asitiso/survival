const clamp01 = (v) => Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));
export const SAFE_LANE_ATTENTION_RECOVERY_HOLD_SECONDS = .18;
export function createSafeLaneAttentionRecoveryHysteresisState() { return { level: 0, holdRemaining: 0, presentationOnly: true }; }
export function advanceSafeLaneAttentionRecoveryHysteresis(previous, targetLevel, dt, reducedMotion = false) {
    const target = clamp01(targetLevel), delta = Math.max(0, Number.isFinite(dt) ? dt : 0);
    if (target >= previous.level)
        return { level: target, holdRemaining: target > 0 ? SAFE_LANE_ATTENTION_RECOVERY_HOLD_SECONDS : 0, presentationOnly: true };
    const hold = Math.max(0, previous.holdRemaining - delta);
    if (hold > 0)
        return { level: previous.level, holdRemaining: hold, presentationOnly: true };
    const recoveryRate = reducedMotion ? 4.4 : 2.8, level = Math.max(target, previous.level - delta * recoveryRate);
    return { level, holdRemaining: 0, presentationOnly: true };
}
export function safeLaneAttentionRecoveryPresentation(state) { const level = clamp01(state.level); return { recoveryAlphaScale: 1 - level * .18, bridgeRecoveryScale: 1 - level * .34, secondaryRecovered: level < .08, presentationOnly: true }; }
