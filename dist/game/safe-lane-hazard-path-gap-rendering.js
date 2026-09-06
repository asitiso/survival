const clamp01 = (v) => Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0)), lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
function projection(point, a, b) { const dx = b.x - a.x, dy = b.y - a.y, len2 = dx * dx + dy * dy; if (len2 <= .0001)
    return { t: 0, distance: Math.hypot(point.x - a.x), length: 0 }; const t = clamp01(((point.x - a.x) * dx + (point.y - a.y) * dy) / len2), p = lerp(a, b, t); return { t, distance: Math.hypot(point.x - p.x, point.y - p.y), length: Math.sqrt(len2) }; }
export function safeLaneHazardPathGapPresentation(input) {
    const full = [{ from: { ...input.from }, to: { ...input.to } }], candidates = input.hazards.filter(h => Number.isFinite(h.telegraph) && h.telegraph > 0 && h.telegraph <= .52).map(h => { const projected = projection(h.pos, input.from, input.to), half = Math.min(.44, (Math.max(0, h.radius) + 24) / Math.max(1, projected.length)); return { hazard: h, projection: projected, start: clamp01(projected.t - half), end: clamp01(projected.t + half) }; }).filter(e => e.projection.length > 1 && e.projection.distance <= Math.max(0, e.hazard.radius) + 24).sort((a, b) => a.hazard.telegraph - b.hazard.telegraph || Math.abs(a.projection.t - .5) - Math.abs(b.projection.t - .5) || a.projection.t - b.projection.t || a.hazard.radius - b.hazard.radius);
    if (candidates.length === 0)
        return { gapApplied: false, segments: full, locatorVisible: true, mergedHazardCount: 0, presentationOnly: true };
    const primary = candidates[0], joined = new Set([primary]);
    let start = primary.start, end = primary.end, changed = true;
    while (changed) {
        changed = false;
        for (const candidate of candidates) {
            if (joined.has(candidate))
                continue;
            if (candidate.start <= end && candidate.end >= start) {
                joined.add(candidate);
                start = Math.min(start, candidate.start);
                end = Math.max(end, candidate.end);
                changed = true;
            }
        }
    }
    const segments = [];
    if (start > .035)
        segments.push({ from: { ...input.from }, to: lerp(input.from, input.to, start) });
    if (end < .965)
        segments.push({ from: lerp(input.from, input.to, end), to: { ...input.to } });
    if (segments.length === 0)
        segments.push({ from: { ...input.from }, to: lerp(input.from, input.to, Math.max(.04, Math.min(.18, start))) });
    return { gapApplied: true, segments, locatorVisible: true, mergedHazardCount: joined.size, gap: { start, end, hazardCount: joined.size }, presentationOnly: true };
}
