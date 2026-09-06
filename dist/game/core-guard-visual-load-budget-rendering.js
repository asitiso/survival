const clamp01 = (v) => Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));
export function coreGuardVisualLoadBudgetPresentation(input, reducedFlash = false) {
    const authoredHit = clamp01(input.coreHitAlphaScale), projectile = clamp01(input.projectileAccentAlpha), contact = clamp01(input.contactAccentAlpha), mitigation = clamp01(input.mitigationRatio);
    const visualLoadCap = reducedFlash ? .62 : .90, guardOwnedBias = mitigation * (input.mixedPressure ? .62 : .52), hitPriorityScale = Math.max(.38, 1 - guardOwnedBias * .72), accentLoad = projectile + contact;
    const rawLoad = authoredHit * hitPriorityScale + accentLoad * .55, globalScale = rawLoad > visualLoadCap ? visualLoadCap / Math.max(.001, rawLoad) : 1;
    const coreHitAlphaScale = hitPriorityScale * globalScale, accentAlphaScale = globalScale, combinedVisualLoad = authoredHit * coreHitAlphaScale + accentLoad * accentAlphaScale * .55;
    return { coreHitAlphaScale, accentAlphaScale, combinedVisualLoad, visualLoadCap, guardOwnedBias, presentationOnly: true };
}
