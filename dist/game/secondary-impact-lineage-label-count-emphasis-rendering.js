export const SECONDARY_IMPACT_LABEL_COUNT_MAX_SCALE = 1.09;
export const SECONDARY_IMPACT_LABEL_COUNT_PULSE_DECAY = .28;
export function secondaryImpactLineageLabelCountEmphasis(memory, lineageKey, count, visible, reducedFlash = false) {
    const existing = memory.find(e => e.lineageKey === lineageKey), safeCount = Math.max(0, Math.floor(Number.isFinite(count) ? count : 0));
    if (!visible)
        return { presentation: { scale: 1, changed: false, presentationOnly: true }, memory: memory.filter(e => e.lineageKey !== lineageKey).map(e => ({ ...e })) };
    const changed = Boolean(existing && existing.lastCount !== safeCount), pulse = changed ? 1 : Math.max(0, (existing?.pulse ?? 0) - SECONDARY_IMPACT_LABEL_COUNT_PULSE_DECAY), maxBoost = (SECONDARY_IMPACT_LABEL_COUNT_MAX_SCALE - 1) * (reducedFlash ? .52 : 1), scale = 1 + pulse * maxBoost;
    const next = { lineageKey, lastCount: safeCount, pulse, presentationOnly: true };
    return { presentation: { scale, changed, presentationOnly: true }, memory: [...memory.filter(e => e.lineageKey !== lineageKey).map(e => ({ ...e })), next] };
}
