export function fourEightHourShopSilence(elapsedSeconds, state) {
    const elapsed = Number.isFinite(elapsedSeconds) ? Math.max(0, elapsedSeconds) : 0;
    if (elapsed < 14400)
        return { active: false, suppressRoutinePressure: false, showTokenCount: true, secondaryLabel: '', keepClickable: true, estimatedVisitReduction: 0, economyMutation: false, newControlCount: 0 };
    const complete = (state.weapon?.rank ?? 0) >= 5 && (state.armor?.rank ?? 0) >= 5;
    const stocked = state.healingPotions >= 2;
    if (!complete || !stocked)
        return { active: true, suppressRoutinePressure: false, showTokenCount: true, secondaryLabel: '', keepClickable: true, estimatedVisitReduction: 0, economyMutation: false, newControlCount: 0 };
    return { active: true, suppressRoutinePressure: true, showTokenCount: false, secondaryLabel: '', keepClickable: true, estimatedVisitReduction: .66, economyMutation: false, newControlCount: 0 };
}
