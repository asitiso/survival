function clamp01(v) { return Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0)); }
export function bossHazardClearedGroundMemoryPresentation(input, reducedFlash = false) {
    const life = input.memoryMaxTtl > 0 ? clamp01(input.memoryTtl / input.memoryMaxTtl) : 0;
    if (life <= 0)
        return { owner: 'retired', clearedAlpha: 0, telegraphAlphaScale: 1, radiusScale: 1, presentationOnly: true };
    const repeated = Number.isFinite(input.nextHazardDistance) && input.nextHazardDistance <= 110 && input.nextHazardTelegraph > 0;
    if (repeated)
        return { owner: 'telegraph', clearedAlpha: 0, telegraphAlphaScale: reducedFlash ? 1.04 : 1.08, radiusScale: 1, presentationOnly: true };
    if (input.aftermathActive)
        return { owner: 'hidden', clearedAlpha: 0, telegraphAlphaScale: 1, radiusScale: 1, presentationOnly: true };
    const progress = 1 - life, flashScale = reducedFlash ? .52 : 1;
    return { owner: 'cleared', clearedAlpha: Math.min(.2, (.08 + life * .3) * flashScale), telegraphAlphaScale: 1, radiusScale: .98 + progress * .06, presentationOnly: true };
}
