const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const RECOVERY_DOMINANCE = { inferno: 1, summoner: .96, juggernaut: 1.08, abyssWitch: .96, twinMaw: 1.02, timeEater: 1.04 };
export function bossStaggerSpecialRecoveryArbitrationPresentation(archetype, phase, input, _reducedMotion = false) {
    const stagger = clamp(input.stagger, 0, 1), recovery = clamp(input.recovery, 0, 1);
    const telegraphProtected = Number.isFinite(input.specialTimer) && input.specialTimer >= 0 && input.specialTimer <= 1.2;
    if (telegraphProtected)
        return { owner: 'telegraph', telegraphProtected: true, staggerScale: 1, genericRecoilScale: 1, recoveryScale: .12 };
    const phaseStability = phase === 3 ? 1.08 : phase === 2 ? 1.03 : 1;
    if (recovery > .12) {
        const dominance = RECOVERY_DOMINANCE[archetype] * phaseStability;
        const criticalBoost = input.tier === 'critical' ? .08 : 0;
        const staggerScale = clamp(1 - recovery * .92 * dominance + criticalBoost, .1, 1);
        const genericRecoilScale = clamp(1 - recovery * .98 * dominance + (input.tier === 'critical' ? .04 : 0), .08, 1);
        return { owner: 'recovery', telegraphProtected: false, staggerScale, genericRecoilScale, recoveryScale: 1 };
    }
    if (stagger > .06)
        return { owner: 'stagger', telegraphProtected: false, staggerScale: clamp(1 - recovery * .55, .72, 1), genericRecoilScale: clamp(1 - recovery * .65, .68, 1), recoveryScale: clamp(recovery / .12, 0, 1) };
    if (recovery > 0)
        return { owner: 'recovery', telegraphProtected: false, staggerScale: 1, genericRecoilScale: 1, recoveryScale: clamp(recovery / .12, 0, 1) };
    return { owner: 'neutral', telegraphProtected: false, staggerScale: 1, genericRecoilScale: 1, recoveryScale: 0 };
}
