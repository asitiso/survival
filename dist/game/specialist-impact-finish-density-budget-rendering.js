const c = (v) => Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));
export function specialistImpactFinishDensityBudgetPresentation(input, reducedMotion = false, reducedFlash = false) {
    const count = Math.max(0, Math.floor(input.activeCount)), baseCapacity = reducedMotion ? 2 : 4, rolePenalty = input.type === 'assassin' || input.type === 'nullifier' ? 1 : 0, capacity = count <= 3 ? count : Math.max(1, baseCapacity - rolePenalty), visible = input.indexFromNewest < capacity, identity = input.type === 'siegeGolem' ? 1 : input.type === 'assassin' ? .96 : .9, life = .42 + .58 * c(input.life);
    return { visible, alphaScale: visible ? Math.min(1, identity * life) * (reducedFlash ? .64 : 1) : 0, capacity };
}
