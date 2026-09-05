function currentItem(offer, state) { return offer.kind === 'weapon' ? state.weapon : offer.kind === 'armor' ? state.armor : null; }
export function lateShopFastPath(elapsedSeconds, quickOffer, state) {
    const elapsed = Number.isFinite(elapsedSeconds) ? Math.max(0, elapsedSeconds) : 0;
    if (elapsed < 1800 || elapsed > 3600 || !quickOffer || quickOffer.price > state.coins)
        return { promoteQuickBuy: false, reason: 'none', newControlCount: 0, estimatedPointerTravelReduction: 0 };
    if (quickOffer.kind === 'potion')
        return { promoteQuickBuy: true, reason: 'safe-potion', newControlCount: 0, estimatedPointerTravelReduction: .46 };
    const current = currentItem(quickOffer, state);
    const safe = Boolean(current && current.id === quickOffer.id && current.rank < 5);
    return safe ? { promoteQuickBuy: true, reason: 'repeat-upgrade', newControlCount: 0, estimatedPointerTravelReduction: .46 } : { promoteQuickBuy: false, reason: 'none', newControlCount: 0, estimatedPointerTravelReduction: 0 };
}
