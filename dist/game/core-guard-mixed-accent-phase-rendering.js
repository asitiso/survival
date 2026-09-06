const clamp01 = (v) => Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));
export function coreGuardMixedAccentPhasePresentation(input, reducedFlash = false) {
    if (!input.mixedPressure)
        return { projectileAlphaScale: 1, contactAlphaScale: 1, projectileLengthScale: 1, contactRadiusScale: 1, presentationOnly: true };
    const life = clamp01(Math.max(0, input.ttl) / Math.max(.001, input.maxTtl)), progress = 1 - life, flashScale = reducedFlash ? .78 : 1;
    const projectileAlphaScale = (1 - progress * .52) * flashScale, contactAlphaScale = (.58 + progress * .42) * flashScale, projectileLengthScale = 1.12 - progress * .22, contactRadiusScale = .90 + progress * .22;
    return { projectileAlphaScale, contactAlphaScale, projectileLengthScale, contactRadiusScale, presentationOnly: true };
}
