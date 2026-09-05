function clamp01(v) { return Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0)); }
export function coreContactGuardMemoryPresentation(input, reducedFlash = false) {
    const life = input.maxTtl > 0 ? clamp01(input.ttl / input.maxTtl) : 0, prevented = clamp01(input.preventedRatio);
    if (life <= 0)
        return { owner: 'retired', contactAlpha: 0, memoryAlpha: 0, braceWidth: 28, braceHeight: 10, projectileArcAlphaScale: 1, presentationOnly: true };
    if (prevented < .14)
        return { owner: 'impact', contactAlpha: 0, memoryAlpha: 0, braceWidth: 28, braceHeight: 10, projectileArcAlphaScale: 1, presentationOnly: true };
    const flashScale = reducedFlash ? .58 : 1, braceWidth = Math.min(62, 34 + prevented * 32), braceHeight = Math.min(24, 10 + prevented * 16);
    if (life <= .28)
        return { owner: 'memory', contactAlpha: 0, memoryAlpha: Math.min(.2, (.05 + prevented * .16) * life / .28 * flashScale), braceWidth, braceHeight, projectileArcAlphaScale: 0, presentationOnly: true };
    return { owner: 'contact-guard', contactAlpha: clamp01((.36 + prevented * .48) * life * flashScale), memoryAlpha: 0, braceWidth, braceHeight, projectileArcAlphaScale: 0, presentationOnly: true };
}
