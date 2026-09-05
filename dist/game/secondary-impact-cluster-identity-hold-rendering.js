const CELL = 64, HOLD = .18;
export function createSecondaryImpactClusterIdentityHoldState() { return { entries: [] }; }
function keyFor(pos) { return `${Math.floor(pos.x / CELL)}:${Math.floor(pos.y / CELL)}`; }
export function advanceSecondaryImpactClusterIdentityHold(state, impacts, dt) {
    const safeDt = Math.max(0, Number.isFinite(dt) ? dt : 0), counts = new Map();
    for (const impact of impacts) {
        const key = keyFor(impact.pos);
        counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const prev = new Map(state.entries.map(e => [e.key, e])), entries = [];
    for (const [key, count] of counts) {
        const old = prev.get(key);
        if (!old || count >= old.heldCount) {
            entries.push({ key, heldCount: count, holdTtl: HOLD });
            continue;
        }
        const ttl = Math.max(0, old.holdTtl - safeDt);
        entries.push({ key, heldCount: ttl > 0 ? old.heldCount : count, holdTtl: ttl > 0 ? ttl : HOLD });
    }
    return { entries };
}
export function secondaryImpactClusterIdentityFor(state, pos) { const key = keyFor(pos), entry = state.entries.find(e => e.key === key); return { key, heldCount: entry?.heldCount ?? 0, holdTtl: entry?.holdTtl ?? 0, presentationOnly: true }; }
