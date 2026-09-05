export function ultraLongShopFocus(elapsedSeconds, state) {
    const elapsed = Number.isFinite(elapsedSeconds) ? Math.max(0, elapsedSeconds) : 0;
    if (elapsed < 7200)
        return { active: false, deemphasizeShop: false, showTokenCount: true, secondaryLabel: '', keepClickable: true, estimatedVisitReduction: 0, economyMutation: false };
    const complete = (state.weapon?.rank ?? 0) >= 5 && (state.armor?.rank ?? 0) >= 5;
    const stocked = state.healingPotions >= 2;
    if (!complete || !stocked)
        return { active: true, deemphasizeShop: false, showTokenCount: true, secondaryLabel: '', keepClickable: true, estimatedVisitReduction: 0, economyMutation: false };
    return { active: true, deemphasizeShop: true, showTokenCount: false, secondaryLabel: '선택', keepClickable: true, estimatedVisitReduction: .56, economyMutation: false };
}
