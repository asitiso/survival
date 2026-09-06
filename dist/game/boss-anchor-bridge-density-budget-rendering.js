const c = (v) => Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));
export function bossAnchorBridgeDensityBudgetPresentation(input, reducedMotion = false, reducedFlash = false) {
    const count = Math.max(0, Math.floor(input.activeCount)), capacity = count <= 4 ? count : (reducedMotion ? 3 : 5), visible = input.indexFromNewest < capacity, alpha = (.38 + .62 * c(input.life)) * (reducedFlash ? .66 : 1);
    return { visible, alphaScale: visible ? alpha : 0, capacity };
}
