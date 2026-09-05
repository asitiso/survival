const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export function bossHazardLifecycleOwnerPresentation(input, reducedFlash = false) { const telegraph = Math.max(0, input.telegraph), ttl = Math.max(0, input.ttl), after = Math.max(0, input.aftermathTtl), afterMax = Math.max(.0001, input.aftermathMaxTtl); if (after > 0 && ttl <= 0) {
    const sustain = clamp(after / afterMax, 0, 1);
    return { owner: 'aftermath', telegraphAlphaScale: 0, activeAlphaScale: 0, aftermathAlphaScale: sustain * (reducedFlash ? .62 : 1), presentationOnly: true };
} if (telegraph > 0 && ttl > 0)
    return { owner: 'telegraph', telegraphAlphaScale: 1, activeAlphaScale: 0, aftermathAlphaScale: 0, presentationOnly: true }; if (ttl > 0)
    return { owner: 'active', telegraphAlphaScale: 0, activeAlphaScale: 1, aftermathAlphaScale: 0, presentationOnly: true }; return { owner: 'retired', telegraphAlphaScale: 0, activeAlphaScale: 0, aftermathAlphaScale: 0, presentationOnly: true }; }
