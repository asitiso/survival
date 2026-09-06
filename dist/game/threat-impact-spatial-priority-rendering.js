const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
export function projectileSpatialSeparationPresentation(input, reducedMotion = false) {
    const density = clamp01((Math.max(1, input.neighborCount) - 1) / 7), rank = Math.max(0, Math.floor(input.indexFromNewest)), radius = Math.max(1, Number.isFinite(input.radius) ? input.radius : 1);
    if (density <= .001)
        return { lateralOffset: 0, trailAlphaScale: 1, bodyAlphaScale: 1, presentationOnly: true };
    const direction = rank % 2 === 0 ? 1 : -1, offsetMagnitude = Math.min(18, radius * 1.2) * density * (input.bossCritical ? .72 : 1) * (reducedMotion ? .55 : 1);
    return { lateralOffset: direction * offsetMagnitude, trailAlphaScale: 1 - density * (input.bossCritical ? .14 : .3), bodyAlphaScale: 1, presentationOnly: true };
}
export function impactClusterCompressionPresentation(input, reducedFlash = false) {
    const density = clamp01((Math.max(1, input.neighborCount) - 1) / 7), life = clamp01(input.life), secondary = input.secondary;
    const radiusScale = 1 - density * (secondary ? .3 : .18), flash = reducedFlash ? .84 : 1;
    const fillAlphaScale = (1 - density * (secondary ? .44 : .28)) * (.9 + .1 * life) * flash;
    const edgeAlphaScale = Math.max(fillAlphaScale, .72 - density * .06) * (reducedFlash ? .96 : 1);
    return { density, radiusScale, fillAlphaScale, edgeAlphaScale, presentationOnly: true };
}
export function hazardSafeLaneCarvePresentation(input, reducedFlash = false) {
    if (!input.hazardActive)
        return { carve: 0, fillAlphaScale: 1, hazardEdgeAlphaScale: 1, safeLaneAlphaScale: 1, presentationOnly: true };
    const proximity = clamp01(input.laneProximity), pressure = clamp01(input.pressure), carve = proximity * (.55 + .45 * pressure), flash = reducedFlash ? .72 : 1;
    return { carve, fillAlphaScale: 1 - carve * .42, hazardEdgeAlphaScale: Math.max(.9, (.96 + .04 * (1 - carve)) * (reducedFlash ? .98 : 1)), safeLaneAlphaScale: 1 + carve * .16 * flash, presentationOnly: true };
}
export function safeLaneCorridorReservationPresentation(input, reducedFlash = false) {
    const confidence = clamp01(input.confidence), occlusion = clamp01(input.occlusion), threat = clamp01(input.threatPressure), focus = clamp01(occlusion * .58 + threat * .42) * (.72 + .28 * confidence), flash = reducedFlash ? .7 : 1;
    return { focus, pathAlphaFloor: Math.max(.88, .88 + confidence * .08), safeLaneAlphaScale: 1 + focus * .18 * flash, decorationAlphaScale: 1 - focus * .4, presentationOnly: true };
}
export function silhouetteLocalContrastPresentation(input, reducedMotion = false) {
    const threat = clamp01(input.threatProximity);
    if (input.owner === 'locomotion' && threat < .15)
        return { overlayAlphaScale: 1, trailAlphaScale: 1, bodyAlphaScale: 1, presentationOnly: true };
    const ownerWeight = input.owner === 'special' ? 1 : input.owner === 'attack' ? .88 : input.owner === 'hit' ? .76 : input.owner === 'recovery' ? .56 : .25;
    const suppression = clamp01(threat * (input.specialist ? .72 : .58) + ownerWeight * .18);
    return { overlayAlphaScale: 1 - suppression * .32, trailAlphaScale: (1 - suppression * .46) * (reducedMotion ? .8 : 1), bodyAlphaScale: 1, presentationOnly: true };
}
export function bossCriticalFocusReservationPresentation(input, reducedFlash = false) {
    const pressure = clamp01(input.pressure), critical = clamp01(Math.max(0, input.criticalCount) / 3), focus = clamp01((input.bossSpecial ? .48 : 0) + critical * .36 + pressure * .34), flash = reducedFlash ? .72 : 1;
    return { focus, criticalAlphaScale: 1, secondaryAlphaScale: 1 - focus * .42, safeLaneAlphaScale: 1 + focus * .13 * flash, presentationOnly: true };
}
