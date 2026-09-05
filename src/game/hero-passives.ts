export function kainOverloadNext(current: number, moving: boolean, dt: number, gainMultiplier = 1): number {
  const safeDt = Math.max(0, dt);
  const safeGain = Math.max(0, gainMultiplier);
  const next = current + (moving ? 0.38 * safeGain : -0.22) * safeDt;
  return Math.max(0, Math.min(1, next));
}

export function kainOverloadCooldownMultiplier(overload: number, maxReduction = 0.20): number {
  const clamped = Math.max(0, Math.min(1, overload));
  const reduction = Math.max(0, Math.min(0.60, maxReduction));
  return 1 - clamped * reduction;
}
