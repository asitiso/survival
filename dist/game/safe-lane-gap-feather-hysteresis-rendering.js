const clamp = (v) => Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));
export function createSafeLaneGapFeatherHysteresisState() { return { visible: false, start: 0, end: 0, release: 0, lastAt: -1 }; }
export function advanceSafeLaneGapFeatherHysteresisState(state, gap, now, reducedMotion = false) {
    const current = state ?? createSafeLaneGapFeatherHysteresisState(), time = Number.isFinite(now) ? now : 0, dt = current.lastAt < 0 ? 0 : Math.max(0, Math.min(.35, time - current.lastAt));
    if (reducedMotion) {
        if (!gap)
            return { visible: false, start: current.start, end: current.end, release: 0, lastAt: time };
        return { visible: true, start: clamp(Math.min(gap.start, gap.end)), end: clamp(Math.max(gap.start, gap.end)), release: 0, lastAt: time };
    }
    if (gap) {
        const start = clamp(Math.min(gap.start, gap.end)), end = clamp(Math.max(gap.start, gap.end));
        if (!current.visible)
            return { visible: true, start, end, release: .14, lastAt: time };
        const blend = 1 - Math.exp(-dt / .085);
        return { visible: true, start: current.start + (start - current.start) * blend, end: current.end + (end - current.end) * blend, release: .14, lastAt: time };
    }
    const release = Math.max(0, current.release - dt);
    return { visible: current.visible && release > 0, start: current.start, end: current.end, release, lastAt: time };
}
