const clamp01 = (value) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
export function dashPatternOwnershipPresentation(input, reducedMotion = false, reducedFlash = false) {
    const crowd = clamp01(input.crowd), protectedPattern = input.family === 'safeLane' || input.bossProtected || (input.family === 'projectile' && input.critical);
    const familyWeight = input.family === 'hazard' ? .52 : input.family === 'impact' ? .48 : input.family === 'specialist' ? .44 : .36;
    const accessibility = protectedPattern ? 1 : (reducedMotion ? 1.015 : 1) * (reducedFlash ? 1.04 : 1);
    return { canonicalDashGapScale: 1, dashGapScale: protectedPattern ? 1 : (1 + crowd * familyWeight) * accessibility, protectedPattern, presentationOnly: true };
}
export function dashPatternOwnershipBudgetPresentation(input, reducedMotion = false, reducedFlash = false) {
    const critical = clamp01(Math.max(0, input.criticalCount) / 3), crowd = clamp01(input.crowd), stress = clamp01(crowd * .78 + critical * .18 + (input.bossActive ? .04 : 0)), laneReserve = input.safeLaneVisible ? .05 : 0, accessibility = (reducedMotion ? 1.015 : 1) * (reducedFlash ? 1.04 : 1);
    return { stress, canonicalDashGapScale: 1, secondaryDashGapScale: (1 + stress * .42 + laneReserve) * accessibility, safeLaneDashGapScale: 1, presentationOnly: true };
}
