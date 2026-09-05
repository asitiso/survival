export function bossClearedSafeLaneArbitrationPresentation(input, reducedFlash = false) {
    const target = input.safeLaneTarget, confidence = Math.max(0, Math.min(1, input.safeLaneConfidence ?? 0));
    if (input.shape === 'circle' || !target || confidence < .45)
        return { owner: 'cleared', agrees: false, clearedAlphaScale: 1, safeLaneAlphaScale: 1, presentationOnly: true };
    const dx = target.x - input.center.x, dy = target.y - input.center.y, c = Math.cos(-input.angle), s = Math.sin(-input.angle), x = dx * c - dy * s, y = dx * s + dy * c, halfLength = Math.max(0, input.halfLength), halfWidth = Math.max(0, input.halfWidth);
    const agrees = input.shape === 'corridor' ? Math.abs(x) <= halfLength + 24 && Math.abs(y) <= halfWidth + 28 : (Math.abs(x) <= halfLength + 18 && Math.abs(y) <= halfWidth + 24) || (Math.abs(y) <= halfLength + 18 && Math.abs(x) <= halfWidth + 24);
    if (!agrees)
        return { owner: 'safe-lane', agrees: false, clearedAlphaScale: 0, safeLaneAlphaScale: 1, presentationOnly: true };
    return { owner: 'shared', agrees: true, clearedAlphaScale: reducedFlash ? .42 : .56, safeLaneAlphaScale: 1, presentationOnly: true };
}
