const clamp = (v) => Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));
export function specialistImpactFinishResponseArbitrationPresentation(input, reducedFlash = false) {
    const r = clamp(input.responseStrength), owner = r >= .72 ? 'response' : r >= .25 ? 'mixed' : 'finish', base = owner === 'response' ? Math.max(.12, 1 - r * .86) : owner === 'mixed' ? 1 - r * .68 : 1;
    return { owner, alphaScale: base * (reducedFlash ? .72 : 1) };
}
