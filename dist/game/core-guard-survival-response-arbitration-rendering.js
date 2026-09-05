function clamp01(value) { return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0)); }
export function coreGuardSurvivalResponseArbitrationPresentation(input, reducedFlash = false) {
    const ttl = Math.max(0, Number.isFinite(input.survivalTtl) ? input.survivalTtl : 0), maxTtl = Math.max(.001, Number.isFinite(input.survivalMaxTtl) ? input.survivalMaxTtl : .001), life = clamp01(ttl / maxTtl), worldGuardStrength = clamp01(input.worldGuardStrength);
    if (life <= 0)
        return { owner: 'retired', worldGuardOwned: Boolean(input.worldGuardOwned), survivalAlphaScale: 0, presentationOnly: true };
    const worldOwns = Boolean(input.worldGuardOwned) || worldGuardStrength >= .14;
    if (worldOwns)
        return { owner: (worldGuardStrength >= .14 ? 'world' : 'retired'), worldGuardOwned: true, survivalAlphaScale: 0, presentationOnly: true };
    return { owner: 'survival', worldGuardOwned: false, survivalAlphaScale: reducedFlash ? .76 : 1, presentationOnly: true };
}
