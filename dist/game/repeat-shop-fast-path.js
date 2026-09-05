function currentItem(offer, state) {
    return offer.kind === 'weapon' ? state.weapon : offer.kind === 'armor' ? state.armor : null;
}
export function repeatShopFastPath(elapsedSeconds, quickOffer, state) {
    const elapsed = Number.isFinite(elapsedSeconds) ? Math.max(0, elapsedSeconds) : 0;
    if (elapsed < 180 || elapsed >= 900 || !quickOffer || quickOffer.kind === 'potion')
        return { promoteQuickBuy: false, reason: 'none', newControlCount: 0, estimatedPointerTravelReduction: 0 };
    const current = currentItem(quickOffer, state);
    const same = Boolean(current && current.id === quickOffer.id && current.rank < 5 && quickOffer.price <= state.coins);
    return same
        ? { promoteQuickBuy: true, reason: 'repeat-upgrade', newControlCount: 0, estimatedPointerTravelReduction: .42 }
        : { promoteQuickBuy: false, reason: 'none', newControlCount: 0, estimatedPointerTravelReduction: 0 };
}
