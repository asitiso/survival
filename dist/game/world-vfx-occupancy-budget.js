const WEIGHT = { tactical: 0, informational: 1, decorative: 2 };
export function worldVfxOccupancyLimits(quality, combatPrimary) {
    const base = quality === 'high' ? { maxCoverage: .34, maxLargeAreaEffects: 4 } : quality === 'medium' ? { maxCoverage: .28, maxLargeAreaEffects: 3 } : { maxCoverage: .22, maxLargeAreaEffects: 2 };
    if (combatPrimary === 'hero-critical' || combatPrimary === 'core-critical' || combatPrimary === 'damage-critical')
        return { maxCoverage: base.maxCoverage * .55, maxLargeAreaEffects: Math.min(2, base.maxLargeAreaEffects) };
    if (combatPrimary === 'boss-response' || combatPrimary === 'damage-heavy' || combatPrimary === 'boss-countdown')
        return { maxCoverage: base.maxCoverage * .72, maxLargeAreaEffects: Math.min(3, base.maxLargeAreaEffects) };
    return base;
}
export function resolveWorldVfxOccupancy(input) {
    const limits = worldVfxOccupancyLimits(input.quality, input.combatPrimary), viewportArea = Math.max(1, input.viewportArea);
    const candidates = [...input.candidates].filter(c => Number.isFinite(c.area) && c.area > 0).sort((a, b) => WEIGHT[a.priority] - WEIGHT[b.priority] || a.id.localeCompare(b.id));
    const allowedIds = [];
    let coverage = 0;
    for (const candidate of candidates) {
        if (allowedIds.length >= limits.maxLargeAreaEffects)
            break;
        const ratio = Math.max(0, candidate.area) / viewportArea;
        if (coverage + ratio > limits.maxCoverage + 1e-9)
            continue;
        allowedIds.push(candidate.id);
        coverage += ratio;
    }
    return { ...limits, allowedIds, coverage, candidateCount: candidates.length };
}
