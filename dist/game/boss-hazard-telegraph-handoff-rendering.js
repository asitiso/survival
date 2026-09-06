const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export function bossHazardTelegraphHandoffPresentation(input, reducedFlash = false) {
    const telegraph = Math.max(0, Number.isFinite(input.telegraph) ? input.telegraph : 0), max = Math.max(.0001, Number.isFinite(input.launchMaxTtl ?? 0) ? input.launchMaxTtl ?? 0 : 0), ttl = Math.max(0, Number.isFinite(input.launchTtl ?? 0) ? input.launchTtl ?? 0 : 0);
    if (telegraph <= 0)
        return { owner: 'active', launchCueAlpha: 0, telegraphAlphaScale: 1, retireLaunchOrigin: true };
    const launchWeight = clamp(ttl / max, 0, 1);
    if (launchWeight <= 0)
        return { owner: 'telegraph', launchCueAlpha: 0, telegraphAlphaScale: 1, retireLaunchOrigin: true };
    return { owner: 'launch', launchCueAlpha: (reducedFlash ? .18 : .32) * launchWeight, telegraphAlphaScale: .72 + .28 * (1 - launchWeight), retireLaunchOrigin: false };
}
export function bossHazardMaterializationFootprintPresentation(input, reducedMotion = false, reducedFlash = false) {
    const max = Math.max(.0001, Number.isFinite(input.launchMaxTtl) ? input.launchMaxTtl : 0), ttl = Math.max(0, Number.isFinite(input.launchTtl) ? input.launchTtl : 0), raw = clamp(1 - ttl / max, 0, 1), progress = clamp(raw * (reducedMotion ? 1.18 : 1), 0, 1), eased = progress * progress * (3 - 2 * progress), radius = Math.max(7, Math.max(0, input.radius) * (.12 + .52 * eased)), center = { x: input.launchOrigin.x + (input.hazardPos.x - input.launchOrigin.x) * eased, y: input.launchOrigin.y + (input.hazardPos.y - input.launchOrigin.y) * eased }, visible = ttl > 0 && max > 0, alphaScale = visible ? (.56 - .24 * progress) * (reducedFlash ? .58 : 1) : 0, telegraphAlphaScale = visible ? .58 + .42 * progress : 1;
    return { visible, center, radius, alphaScale, telegraphAlphaScale, progress, presentationOnly: true };
}
export function bossHazardFootprintDensityBudgetPresentation(input, reducedMotion = false, reducedFlash = false) {
    const count = Math.max(0, Math.floor(input.activeCount)), capacity = count <= 2 ? count : (reducedMotion ? 2 : 3), visible = input.indexFromNewest < capacity, progress = clamp(input.progress, 0, 1), alphaScale = visible ? (.62 + .38 * progress) * (reducedFlash ? .64 : 1) : 0;
    return { visible, alphaScale, capacity, presentationOnly: true };
}
export function bossHazardFootprintLifecycleHandoffPresentation(input, reducedFlash = false) {
    const progress = clamp(Number.isFinite(input.footprintProgress) ? input.footprintProgress : 1, 0, 1), telegraph = Math.max(0, Number.isFinite(input.telegraph) ? input.telegraph : 0), ttl = Math.max(0, Number.isFinite(input.ttl) ? input.ttl : 0);
    if (ttl <= 0)
        return { owner: 'retired', footprintAlphaScale: 0, telegraphAlphaScale: 0, activeAlphaScale: 0, presentationOnly: true };
    if (telegraph <= 0)
        return { owner: 'active', footprintAlphaScale: 0, telegraphAlphaScale: 0, activeAlphaScale: 1, presentationOnly: true };
    const footprintWeight = input.footprintVisible ? clamp(1 - progress / .72, 0, 1) : 0, footprintAlphaScale = footprintWeight * (reducedFlash ? .6 : 1), telegraphAlphaScale = clamp(.62 + .38 * progress, 0, 1);
    return { owner: (footprintWeight > .28 ? 'footprint' : 'telegraph'), footprintAlphaScale, telegraphAlphaScale, activeAlphaScale: 0, presentationOnly: true };
}
export function bossHazardPersistentActivationSettlePresentation(input, reducedFlash = false) {
    const telegraph = Math.max(0, Number.isFinite(input.telegraph) ? input.telegraph : 0), ttl = Math.max(0, Number.isFinite(input.ttl) ? input.ttl : 0);
    if (ttl <= 0)
        return { owner: 'retired', activeAlphaScale: 0, edgeAlphaScale: 0, presentationOnly: true };
    if (telegraph > 0)
        return { owner: 'telegraph', activeAlphaScale: 0, edgeAlphaScale: 0, presentationOnly: true };
    const max = Math.max(.0001, Number.isFinite(input.activationMaxTtl ?? 0) ? input.activationMaxTtl ?? 0 : .0001), left = Math.max(0, Number.isFinite(input.activationTtl ?? 0) ? input.activationTtl ?? 0 : 0), progress = Math.max(0, Math.min(1, 1 - left / max)), settling = left > 0;
    return { owner: (settling ? 'activation' : 'active'), activeAlphaScale: settling ? (.62 + .38 * progress) : 1, edgeAlphaScale: settling ? (reducedFlash ? .16 : .28) * (1 - progress) : 0, presentationOnly: true };
}
export function bossHazardActivationDensityBudgetPresentation(input, reducedMotion = false) {
    const count = Math.max(0, Math.floor(input.activeActivationCount)), index = Math.max(0, Math.floor(input.indexFromNewest));
    if (input.owner !== 'activation')
        return { effectStrength: 0, activeVisible: input.owner === 'active', capacity: 0, presentationOnly: true };
    if (count <= 2)
        return { effectStrength: 1, activeVisible: true, capacity: count, presentationOnly: true };
    const capacity = reducedMotion ? 2 : 3, effectStrength = index < capacity ? Math.max(.55, 1 - index * .18) : 0;
    return { effectStrength, activeVisible: true, capacity, presentationOnly: true };
}
