function clamp01(v) { return Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0)); }
const HOLD_TTL = .14, SWITCH_MARGIN = .1, HOLD_MARGIN = .16;
export function createCoreMixedPressureGuardArbitrationState() { return { owner: 'none', holdTtl: 0, projectileStrength: 0, contactStrength: 0 }; }
export function advanceCoreMixedPressureGuardArbitration(previous, input, dt) {
    const projectileStrength = clamp01(input.projectileStrength), contactStrength = clamp01(input.contactStrength), safeDt = Math.max(0, Number.isFinite(dt) ? dt : 0);
    if (projectileStrength <= 0 && contactStrength <= 0)
        return { owner: 'none', holdTtl: 0, projectileStrength, contactStrength };
    let owner = previous.owner, holdTtl = Math.max(0, previous.holdTtl - safeDt);
    if (projectileStrength <= 0)
        owner = 'contact';
    else if (contactStrength <= 0)
        owner = 'projectile';
    else if (owner === 'none')
        owner = projectileStrength >= contactStrength ? 'projectile' : 'contact';
    else {
        const current = owner === 'projectile' ? projectileStrength : contactStrength, challenger = owner === 'projectile' ? contactStrength : projectileStrength;
        const margin = holdTtl > 0 ? HOLD_MARGIN : SWITCH_MARGIN;
        if (challenger > current + margin)
            owner = owner === 'projectile' ? 'contact' : 'projectile';
    }
    if (owner !== previous.owner)
        holdTtl = HOLD_TTL;
    return { owner, holdTtl, projectileStrength, contactStrength };
}
export function coreMixedPressureGuardArbitrationPresentation(state, reducedFlash = false) {
    if (state.owner === 'projectile')
        return { owner: state.owner, projectileAlphaScale: 1, contactAlphaScale: state.contactStrength > 0 ? (reducedFlash ? .08 : .14) : 0, presentationOnly: true };
    if (state.owner === 'contact')
        return { owner: state.owner, projectileAlphaScale: state.projectileStrength > 0 ? (reducedFlash ? .08 : .14) : 0, contactAlphaScale: 1, presentationOnly: true };
    return { owner: 'none', projectileAlphaScale: 1, contactAlphaScale: 1, presentationOnly: true };
}
