import { clamp } from '../../core/math.js';
function urgencyFor(phase) {
    if (phase === 'stable')
        return .24;
    if (phase === 'collapse')
        return .72;
    if (phase === 'collapsed')
        return 1;
    return .46;
}
export function safeLaneForecast(lane, zone, encounterElapsedMs) {
    if (!lane || !zone)
        return null;
    const elapsed = Math.max(0, Number.isFinite(encounterElapsedMs) ? encounterElapsedMs : 0);
    const local = elapsed % Math.max(1, zone.cycleMs);
    return {
        label: 'SAFE FORECAST',
        phase: zone.phase,
        currentTarget: { ...lane.target },
        nextTarget: { ...zone.nextCenter },
        urgency: clamp(urgencyFor(zone.phase), 0, 1),
        transitionMs: Math.max(0, zone.phaseEndMs - local),
        autoMove: false,
    };
}
