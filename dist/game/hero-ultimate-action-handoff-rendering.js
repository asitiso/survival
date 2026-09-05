const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export function advanceHeroUltimateActionHandoffState(previous, normalCastTriggered, dt, reducedMotion = false, ultimateTriggered = false) {
    if (ultimateTriggered)
        return { normalCast: 0 };
    if (normalCastTriggered)
        return { normalCast: 1 };
    const prev = previous ?? { normalCast: 0 };
    const safeDt = clamp(Number.isFinite(dt) ? dt : 0, 0, .1);
    const duration = reducedMotion ? .2 : .28;
    return { normalCast: Math.max(0, prev.normalCast - safeDt / duration) };
}
export function heroUltimateActionHandoffPresentation(ultimate, handoff, movementSpeed, _reducedMotion = false) {
    if (!ultimate?.kind)
        return { owner: 'neutral', movementOwnership: 0, normalCastOwnership: 0, ultimatePoseScale: 0, castRecoverySuppressionScale: 0 };
    const elapsed = clamp(ultimate.elapsed, 0, .62);
    const handoffWindow = clamp((elapsed - .16) / .18, 0, 1);
    const speed = clamp(Number.isFinite(movementSpeed) ? movementSpeed : 0, 0, 1.4);
    const movementOwnership = clamp(((speed - .08) / .84) * handoffWindow * .88, 0, .88);
    const normalCastOwnership = clamp((handoff?.normalCast ?? 0) * handoffWindow * 1.15, 0, 1);
    let owner = 'ultimate';
    if (normalCastOwnership > .12 && normalCastOwnership >= movementOwnership + .04)
        owner = 'spell';
    else if (movementOwnership > .12)
        owner = 'movement';
    const claim = Math.max(movementOwnership * .78, normalCastOwnership * .92);
    const ultimatePoseScale = clamp(1 - claim, .08, 1);
    const castRecoverySuppressionScale = clamp(ultimatePoseScale * (1 - normalCastOwnership * .24), .06, 1);
    return { owner, movementOwnership, normalCastOwnership, ultimatePoseScale, castRecoverySuppressionScale };
}
