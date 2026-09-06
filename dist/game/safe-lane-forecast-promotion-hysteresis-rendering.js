export const SAFE_LANE_PROMOTION_ENTER_URGENCY = .68;
export const SAFE_LANE_PROMOTION_EXIT_URGENCY = .56;
export function createSafeLaneForecastPromotionHysteresisState() { return { owner: 'current', presentationOnly: true }; }
export function advanceSafeLaneForecastPromotionHysteresis(previous, input) {
    if (!input.hasForecast || !Number.isFinite(input.targetDistance) || input.targetDistance <= 8)
        return { owner: 'current', presentationOnly: true };
    const urgency = Math.max(0, Math.min(1, Number.isFinite(input.urgency) ? input.urgency : 0)), transitionMs = Math.max(0, Number.isFinite(input.transitionMs) ? input.transitionMs : 0);
    if (previous.owner === 'forecast' && urgency >= SAFE_LANE_PROMOTION_EXIT_URGENCY && transitionMs <= 2200)
        return { owner: 'forecast', presentationOnly: true };
    return { owner: urgency >= SAFE_LANE_PROMOTION_ENTER_URGENCY && transitionMs <= 1800 ? 'forecast' : 'current', presentationOnly: true };
}
