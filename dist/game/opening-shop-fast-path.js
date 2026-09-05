export function openingShopFastPath(elapsedSeconds, hasSafeQuickOffer) {
    const promote = elapsedSeconds < 180 && hasSafeQuickOffer;
    return { promoteQuickBuy: promote, position: promote ? 'before-grid' : 'footer', estimatedPointerTravelReduction: promote ? .56 : 0, newControlCount: 0 };
}
