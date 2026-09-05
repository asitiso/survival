const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const COMMITMENT = { shieldbearer: 1.05, assassin: .82, siegeGolem: 1.12, nullifier: .95 };
const TIER_VISIBILITY = { normal: .18, heavy: .28, critical: .38 };
export function specialistAttackHitArbitrationPresentation(type, input, _reducedMotion = false) {
    if (input.fatal)
        return { owner: 'fatal', attackCommitment: 1, attackScale: 0, attackResolveScale: 0, hitStaggerScale: 0, fatalTransitionScale: 1 };
    const pullback = clamp(input.pullback, 0, 1), lunge = clamp(input.lunge, 0, 1), resolve = clamp(input.resolve, 0, 1), hit = clamp(input.hitStagger, 0, 1);
    const attackCommitment = clamp(Math.max(pullback * .92 + lunge * .4, lunge, resolve * .45) * COMMITMENT[type], 0, 1);
    const committed = attackCommitment >= .24;
    const hitStaggerScale = committed ? clamp(1 - attackCommitment * (1 - TIER_VISIBILITY[input.tier]), .12, 1) : 1;
    const owner = committed ? 'attack' : hit > .08 ? 'hit' : 'neutral';
    const attackScale = owner === 'hit' ? clamp(1 - hit * .16, .78, 1) : 1;
    const attackResolveScale = owner === 'hit' ? clamp(1 - hit * .34, .58, 1) : 1;
    return { owner, attackCommitment, attackScale, attackResolveScale, hitStaggerScale, fatalTransitionScale: 0 };
}
