const clamp = (v) => Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));
const norm = (g) => ({ start: clamp(Math.min(g.start, g.end)), end: clamp(Math.max(g.start, g.end)) });
export function safeLaneGapHazardHandoffPresentation(input, reducedMotion = false) {
    const current = input.current && input.current.visible ? norm(input.current) : null, next = input.next ? norm(input.next) : null;
    if (!next)
        return { mode: 'release', resetBeforeAdvance: false, nextGap: null, presentationOnly: true };
    if (!current || reducedMotion)
        return { mode: 'snap', resetBeforeAdvance: true, nextGap: next, presentationOnly: true };
    const overlap = Math.max(0, Math.min(current.end, next.end) - Math.max(current.start, next.start)), currentWidth = Math.max(.001, current.end - current.start), nextWidth = Math.max(.001, next.end - next.start), overlapRatio = overlap / Math.min(currentWidth, nextWidth), centerDelta = Math.abs((current.start + current.end - next.start - next.end) * .5), expandsDanger = next.start < current.start - .04 || next.end > current.end + .04, disconnected = overlapRatio < .18 || centerDelta > .22;
    const snap = expandsDanger || disconnected;
    return { mode: snap ? 'snap' : 'track', resetBeforeAdvance: snap, nextGap: next, presentationOnly: true };
}
