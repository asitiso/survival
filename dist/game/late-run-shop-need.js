export function lateRunShopNeed(elapsedSeconds, state) {
    const elapsed = Number.isFinite(elapsedSeconds) ? Math.max(0, elapsedSeconds) : 0;
    if (elapsed < 3600 || elapsed > 7200)
        return { deemphasizeShop: false, reason: 'inactive', secondaryLabel: '', estimatedVisitReduction: 0, newControlCount: 0 };
    if ((state.weapon?.rank ?? 0) < 5 || (state.armor?.rank ?? 0) < 5)
        return { deemphasizeShop: false, reason: 'needs-upgrade', secondaryLabel: '', estimatedVisitReduction: 0, newControlCount: 0 };
    if (state.healingPotions < 2)
        return { deemphasizeShop: false, reason: 'low-potion', secondaryLabel: '', estimatedVisitReduction: 0, newControlCount: 0 };
    return { deemphasizeShop: true, reason: 'complete-build', secondaryLabel: '선택', estimatedVisitReduction: .5, newControlCount: 0 };
}
