export function eightTwelveHourShopFocus(elapsedSeconds, state) {
    const elapsed = Number.isFinite(elapsedSeconds) ? Math.max(0, elapsedSeconds) : 0;
    if (elapsed < 8 * 3600)
        return { active: false, dormant: false, showTokenCount: true, secondaryLabel: '', visualAlpha: 1, keepClickable: true, estimatedAttentionReduction: 0, economyMutation: false, newControlCount: 0 };
    const complete = (state.weapon?.rank ?? 0) >= 5 && (state.armor?.rank ?? 0) >= 5;
    const stocked = state.healingPotions >= 2;
    if (!complete || !stocked)
        return { active: true, dormant: false, showTokenCount: true, secondaryLabel: '', visualAlpha: 1, keepClickable: true, estimatedAttentionReduction: 0, economyMutation: false, newControlCount: 0 };
    return { active: true, dormant: true, showTokenCount: false, secondaryLabel: '', visualAlpha: .44, keepClickable: true, estimatedAttentionReduction: .74, economyMutation: false, newControlCount: 0 };
}
