function clamp01(v) { return Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0)); }
export function bossHazardAftermathTerrainRetirementPresentation(input, reducedFlash = false) {
    const life = input.aftermathMaxTtl > 0 ? clamp01(input.aftermathTtl / input.aftermathMaxTtl) : 0, progress = 1 - life;
    const overlap = Number.isFinite(input.nextHazardDistance) && input.nextHazardDistance <= 96 && input.nextHazardTelegraph > 0;
    if (life <= 0 || overlap)
        return { owner: 'retired', aftermathAlphaScale: overlap ? .06 : 0, terrainAlphaScale: 0, sizeScale: 1, presentationOnly: true };
    if (progress >= .62) {
        const terrain = clamp01(life / .38) * (reducedFlash ? .48 : .72);
        return { owner: 'terrain', aftermathAlphaScale: Math.min(.28, life * .34), terrainAlphaScale: terrain, sizeScale: .92 + progress * .05, presentationOnly: true };
    }
    return { owner: 'aftermath', aftermathAlphaScale: clamp01(.62 + life * .38) * (reducedFlash ? .64 : 1), terrainAlphaScale: 0, sizeScale: 1, presentationOnly: true };
}
