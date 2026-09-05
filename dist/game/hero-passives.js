export function kainOverloadNext(current, moving, dt, gainMultiplier = 1) {
    const safeDt = Math.max(0, dt);
    const safeGain = Math.max(0, gainMultiplier);
    const next = current + (moving ? 0.38 * safeGain : -0.22) * safeDt;
    return Math.max(0, Math.min(1, next));
}
export function kainOverloadCooldownMultiplier(overload, maxReduction = 0.20) {
    const clamped = Math.max(0, Math.min(1, overload));
    const reduction = Math.max(0, Math.min(0.60, maxReduction));
    return 1 - clamped * reduction;
}
