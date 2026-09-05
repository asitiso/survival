function clamp01(v) { return Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0)); }
export function projectileGuardImpactHandoffPresentation(input, reducedFlash = false) {
    const prevented = clamp01(input.preventedRatio), life = input.impactMaxTtl > 0 ? clamp01(input.impactTtl / input.impactMaxTtl) : 0;
    if (life <= 0)
        return { owner: 'retired', threatAlphaScale: 0, ordinaryImpactAlphaScale: 0, guardImpactAlpha: 0, deflectDistance: 0, presentationOnly: true };
    const guarded = prevented >= .18;
    if (!guarded)
        return { owner: 'impact', threatAlphaScale: 0, ordinaryImpactAlphaScale: 1, guardImpactAlpha: 0, deflectDistance: 0, presentationOnly: true };
    const flashScale = reducedFlash ? .58 : 1;
    const guardImpactAlpha = clamp01((.42 + prevented * .48) * life * flashScale);
    return { owner: 'guard', threatAlphaScale: 0, ordinaryImpactAlphaScale: clamp01(1 - prevented * .52), guardImpactAlpha, deflectDistance: Math.min(22, 7 + prevented * 18) * life, presentationOnly: true };
}
