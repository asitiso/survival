function clamp01(value) { return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0)); }
export function bossClearedSafeLaneForecastTarget(input, _reducedFlash = false) {
    const current = input.currentTarget, forecast = input.nextTarget, urgency = clamp01(input.forecastUrgency ?? 0), transitionMs = Math.max(0, Number.isFinite(input.transitionMs) ? input.transitionMs ?? 0 : 0), imminent = Boolean(forecast) && urgency >= .65 && transitionMs <= 1800;
    if (imminent && forecast)
        return { owner: 'forecast', target: { ...forecast }, confidence: Math.max(clamp01(input.currentConfidence ?? 0), clamp01(.58 + urgency * .34)), presentationOnly: true };
    if (current)
        return { owner: 'current', target: { ...current }, confidence: clamp01(input.currentConfidence ?? 0), presentationOnly: true };
    if (forecast && urgency >= .82)
        return { owner: 'forecast', target: { ...forecast }, confidence: clamp01(.58 + urgency * .34), presentationOnly: true };
    return { owner: 'none', target: undefined, confidence: 0, presentationOnly: true };
}
