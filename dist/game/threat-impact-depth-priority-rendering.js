const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
export function projectileBodyOcclusionPresentation(input, reducedMotion = false) {
    const occlusion = clamp01(input.bodyOcclusion), density = clamp01(input.density), pressure = clamp01(occlusion * .62 + density * .38);
    const suppression = pressure * (input.bossCritical ? .2 : .46) * (reducedMotion ? .1 : 1);
    return { pressure, bodyAlphaScale: 1, trailAlphaScale: Math.max(input.bossCritical ? .82 : .48, 1 - suppression), presentationOnly: true };
}
export function bossTelegraphImpactDepthPresentation(input, reducedFlash = false) {
    const overlap = clamp01(input.overlap), life = clamp01(input.impactLife);
    if (!input.telegraphActive)
        return { telegraphEdgeAlphaScale: 1, impactFillAlphaScale: .86 + .14 * life, impactEdgeAlphaScale: .9 + .1 * life, presentationOnly: true };
    const telegraphEdgeAlphaScale = Math.max(.92, (.96 + .04 * life) * (reducedFlash ? .98 : 1));
    const impactFillAlphaScale = Math.max(.28, (1 - overlap * .56) * (.84 + .16 * life) * (reducedFlash ? .84 : 1));
    const impactEdgeAlphaScale = Math.max(impactFillAlphaScale, .7 + .18 * life);
    return { telegraphEdgeAlphaScale, impactFillAlphaScale, impactEdgeAlphaScale, presentationOnly: true };
}
export function safeLaneProjectileCrossingPresentation(input, reducedMotion = false, reducedFlash = false) {
    const proximity = clamp01(input.laneProximity), threat = clamp01(input.threatLevel), protection = proximity * (.62 + .38 * threat), criticalRelief = input.critical ? .38 : 1;
    return { bodyAlphaScale: 1, trailAlphaScale: Math.max(input.critical ? .78 : .46, 1 - protection * .46 * criticalRelief) * (reducedMotion ? .92 : 1), safeLaneAlphaScale: 1 + protection * .12 * (reducedFlash ? .72 : 1), presentationOnly: true };
}
export function heroImpactInteriorRetirementPresentation(input, reducedFlash = false) {
    const proximity = clamp01(input.heroProximity), life = clamp01(input.life), density = clamp01((Math.max(1, input.neighborCount) - 1) / 7), age = 1 - life, pressure = clamp01(proximity * .44 + density * .34 + age * .3);
    const criticalScale = input.critical ? .55 : 1, fillAlphaScale = Math.max(input.critical ? .58 : .2, 1 - pressure * .62 * criticalScale) * (reducedFlash ? .84 : 1);
    const edgeAlphaScale = Math.max(fillAlphaScale, (.68 + .2 * life) * (reducedFlash ? .96 : 1));
    return { pressure, fillAlphaScale, edgeAlphaScale, presentationOnly: true };
}
export function specialistHazardDepthPresentation(input, reducedMotion = false) {
    const hazard = clamp01(input.hazardPressure), attack = clamp01(input.attackStrength), action = input.owner === 'special' ? 1 : input.owner === 'attack' ? .9 : input.owner === 'hit' ? .7 : input.owner === 'recovery' ? .5 : .18;
    const focus = clamp01(action * .65 + attack * .35), directionAlphaScale = Math.max(.58, .72 + focus * .28 - hazard * .08), trailAlphaScale = (1 - hazard * (.22 + .22 * (1 - focus))) * (reducedMotion ? .82 : 1), hazardDecorationScale = 1 - hazard * (.16 + .2 * focus);
    return { bodyAlphaScale: 1, directionAlphaScale, trailAlphaScale, hazardDecorationScale, presentationOnly: true };
}
export function battlefieldDepthBudgetPresentation(input, reducedMotion = false, reducedFlash = false) {
    const critical = clamp01(Math.max(0, input.criticalCount) / 3), projectile = clamp01(input.projectilePressure), impact = clamp01(input.impactPressure), hazard = clamp01(input.hazardPressure), pressure = clamp01(projectile * .28 + impact * .3 + hazard * .34 + critical * .2 + (input.bossTelegraph ? .12 : 0));
    const motion = reducedMotion ? .9 : 1, flash = reducedFlash ? .88 : 1;
    return { pressure, criticalAlphaScale: 1, canonicalBodyAlphaScale: 1, bossTelegraphEdgeAlphaScale: input.bossTelegraph ? Math.max(.92, .98 * (reducedFlash ? .98 : 1)) : 1, safeLaneAlphaScale: input.safeLaneVisible ? 1 + pressure * .12 * flash : 1, secondaryAlphaScale: (1 - pressure * .42) * motion * flash, presentationOnly: true };
}
