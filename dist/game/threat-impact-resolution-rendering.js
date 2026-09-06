const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
export function projectileCanonicalReclaimPresentation(input, reducedMotion = false, reducedFlash = false) {
    const launch = clamp01(input.launchLife), travel = clamp01(input.travelLife), life = Math.max(launch, travel), speed = clamp01((Math.max(0, Number.isFinite(input.speed) ? input.speed : 0) - 60) / 440);
    if (input.owner === 'canonical' || life <= .02)
        return { owner: 'canonical', transitionAlphaScale: 0, bodyAlphaScale: 1, trailLengthScale: 1, presentationOnly: true };
    const transitionAlphaScale = clamp01((.48 + .38 * life + .14 * speed) * (reducedFlash ? .78 : 1));
    const bodyAlphaScale = .92 + .08 * (1 - life);
    const trailLengthScale = (.82 + .18 * life) * (reducedMotion ? .8 : 1);
    return { owner: input.owner, transitionAlphaScale, bodyAlphaScale, trailLengthScale, presentationOnly: true };
}
export function impactFootprintRetirementPresentation(input, reducedFlash = false) {
    const life = clamp01(input.life), death = input.reaction === 'death', flash = reducedFlash ? .78 : 1;
    const footprintAlphaScale = (.16 + .84 * life) * flash;
    const responseAlphaScale = (.52 + .48 * Math.sqrt(life)) * flash;
    const aftermathAlphaScale = (death ? .46 : .3) + life * (death ? .44 : .38);
    const spriteAlphaScale = .86 + .14 * life;
    return { footprintAlphaScale, responseAlphaScale, aftermathAlphaScale, spriteAlphaScale, presentationOnly: true };
}
export function hazardGroundResolutionPresentation(input, reducedFlash = false) {
    const hazardLife = clamp01(input.hazardLife), memoryLife = clamp01(input.memoryLife), flash = reducedFlash ? .86 : 1;
    if (input.hazardActive)
        return { owner: 'hazard', hazardEdgeAlphaScale: .92 + .08 * hazardLife, clearedGroundAlphaScale: 0, presentationOnly: true };
    if (memoryLife > .01)
        return { owner: 'cleared', hazardEdgeAlphaScale: 0, clearedGroundAlphaScale: (.5 + .5 * memoryLife) * flash, presentationOnly: true };
    return { owner: 'canonical', hazardEdgeAlphaScale: 0, clearedGroundAlphaScale: 0, presentationOnly: true };
}
export function safeLaneCanonicalResolutionPresentation(input, reducedFlash = false) {
    const release = clamp01(input.release), pressure = clamp01(input.hazardPressure), memory = clamp01(Math.max(0, input.memoryCount) / 4);
    if (release <= .001 && pressure <= .001 && memory <= .001)
        return { safeLaneAlphaScale: 1, edgeAlphaScale: 1, presentationOnly: true };
    const focus = clamp01(release * (.62 + .18 * pressure + .2 * memory)), flash = reducedFlash ? .62 : 1;
    return { safeLaneAlphaScale: 1 + focus * .16 * flash, edgeAlphaScale: 1 + focus * .08 * flash, presentationOnly: true };
}
export function silhouetteLocomotionSettlePresentation(input, reducedMotion = false) {
    if (input.owner === 'locomotion')
        return { overlayAlphaScale: 1, trailScale: 1, bodyAlphaScale: 1, presentationOnly: true };
    const locomotion = clamp01(input.locomotionWeight), motion = clamp01(input.motionBlend), turn = clamp01(Math.abs(input.turn));
    const settle = clamp01(locomotion * .78 + motion * .18 - turn * .08);
    const overlayAlphaScale = .68 + .32 * settle;
    const trailScale = (.72 + .28 * settle) * (reducedMotion ? .84 : 1);
    return { overlayAlphaScale, trailScale, bodyAlphaScale: 1, presentationOnly: true };
}
export function continuityResolutionBudgetPresentation(input, reducedMotion = false) {
    const count = Math.max(0, Math.floor(input.activeCount));
    const baseCapacity = input.kind === 'hazard' ? 4 : input.kind === 'silhouette' ? 5 : input.kind === 'projectile' ? 6 : 5;
    const capacity = count <= baseCapacity ? count : Math.max(2, baseCapacity - (reducedMotion ? 1 : 0));
    const visible = input.indexFromNewest < capacity;
    const effectStrength = visible ? 1 : 0;
    return { visible, effectStrength, capacity, bodyAlphaScale: 1, safeLaneAlphaScale: 1, presentationOnly: true };
}
