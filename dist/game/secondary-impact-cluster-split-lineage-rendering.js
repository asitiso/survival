const GROUP_RADIUS = 58, MATCH_RADIUS = 112, LOOKUP_RADIUS = 76, HOLD = .24;
export function createSecondaryImpactClusterSplitLineageState() { return { entries: [], nextId: 1 }; }
function clustersFor(impacts) { const groups = []; for (const impact of impacts) {
    let best = -1, bestD = Infinity;
    for (let i = 0; i < groups.length; i++) {
        const g = groups[i], d = Math.hypot(impact.pos.x - g.x, impact.pos.y - g.y);
        if (d <= GROUP_RADIUS && d < bestD) {
            best = i;
            bestD = d;
        }
    }
    if (best < 0)
        groups.push({ points: [impact.pos], x: impact.pos.x, y: impact.pos.y });
    else {
        const g = groups[best];
        g.points.push(impact.pos);
        g.x = g.points.reduce((n, p) => n + p.x, 0) / g.points.length;
        g.y = g.points.reduce((n, p) => n + p.y, 0) / g.points.length;
    }
} return groups.sort((a, b) => a.x - b.x || a.y - b.y); }
export function advanceSecondaryImpactClusterSplitLineage(previous, impacts, dt) {
    const safeDt = Math.max(0, Number.isFinite(dt) ? dt : 0), groups = clustersFor(impacts), available = previous.entries.map((entry, index) => ({ entry, index, used: false })), entries = [];
    let nextId = Math.max(1, previous.nextId);
    for (const group of groups) {
        let best = -1, bestD = Infinity;
        for (let i = 0; i < available.length; i++) {
            const candidate = available[i];
            if (candidate.used || candidate.entry.retired)
                continue;
            const d = Math.hypot(group.x - candidate.entry.x, group.y - candidate.entry.y);
            if (d <= MATCH_RADIUS && d < bestD) {
                best = i;
                bestD = d;
            }
        }
        if (best >= 0) {
            const match = available[best];
            match.used = true;
            entries.push({ key: match.entry.key, x: group.x, y: group.y, ttl: HOLD, retired: false });
        }
        else
            entries.push({ key: `lineage-${nextId++}`, x: group.x, y: group.y, ttl: HOLD, retired: false });
    }
    for (const candidate of available) {
        if (candidate.used)
            continue;
        const ttl = Math.max(0, candidate.entry.ttl - safeDt);
        if (ttl <= 0)
            continue;
        const mergedIntoLiveGroup = !candidate.entry.retired && groups.some(group => Math.hypot(group.x - candidate.entry.x, group.y - candidate.entry.y) <= MATCH_RADIUS);
        entries.push({ ...candidate.entry, ttl, retired: candidate.entry.retired || mergedIntoLiveGroup });
    }
    return { entries, nextId };
}
export function secondaryImpactSplitLineageFor(state, pos) { let best, bestD = Infinity; for (const entry of state.entries) {
    if (entry.retired)
        continue;
    const d = Math.hypot(pos.x - entry.x, pos.y - entry.y);
    if (d <= LOOKUP_RADIUS && d < bestD) {
        best = entry;
        bestD = d;
    }
} return { key: best?.key ?? `unbound:${Math.floor(pos.x / 64)}:${Math.floor(pos.y / 64)}`, ttl: best?.ttl ?? 0, presentationOnly: true }; }
export function secondaryImpactActiveLineageAnchorFor(state, key) { const entry = state.entries.find(candidate => !candidate.retired && candidate.key === key); return entry ? { key: entry.key, pos: { x: entry.x, y: entry.y }, ttl: entry.ttl, presentationOnly: true } : null; }
