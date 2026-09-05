const RANK = { regular: 0, specialist: 1, elite: 2, boss: 3 };
export function enemySpawnLaneLimit(quality) { return quality === 'high' ? 4 : quality === 'medium' ? 3 : 2; }
function edgeFor(pos, width, height) { const d = [['north', Math.abs(pos.y)], ['east', Math.abs(width - pos.x)], ['south', Math.abs(height - pos.y)], ['west', Math.abs(pos.x)]]; return [...d].sort((a, b) => a[1] - b[1])[0][0]; }
export function enemySpawnLaneCues(input) {
    const critical = input.combatPrimary === 'hero-critical' || input.combatPrimary === 'core-critical' || input.combatPrimary === 'damage-critical';
    const groups = new Map();
    for (const p of input.portals) {
        if (Number.isFinite(p.ttl) && p.ttl <= 0)
            continue;
        if (critical && (p.kind === 'regular' || p.kind === 'specialist'))
            continue;
        const edge = edgeFor(p.pos, input.width, input.height), key = `${edge}:${p.target}`, g = groups.get(key);
        if (g) {
            g.sumX += p.pos.x;
            g.sumY += p.pos.y;
            g.count++;
            g.maxTtl = Math.max(g.maxTtl, Number.isFinite(p.ttl) ? p.ttl : 0);
            if (RANK[p.kind] > RANK[g.kind])
                g.kind = p.kind;
        }
        else
            groups.set(key, { edge, kind: p.kind, target: p.target, sumX: p.pos.x, sumY: p.pos.y, count: 1, maxTtl: Number.isFinite(p.ttl) ? p.ttl : 0 });
    }
    const alphaBase = input.quality === 'high' ? .58 : input.quality === 'medium' ? .48 : .4;
    return [...groups.values()].sort((a, b) => RANK[b.kind] - RANK[a.kind] || b.count - a.count || a.edge.localeCompare(b.edge)).slice(0, enemySpawnLaneLimit(input.quality)).map(g => ({ edge: g.edge, kind: g.kind, target: g.target, start: { x: g.sumX / g.count, y: g.sumY / g.count }, end: { ...(g.target === 'core' ? input.corePos : input.heroPos) }, count: g.count, alpha: critical ? alphaBase * .82 : alphaBase, remainingTtl: g.maxTtl, priority: 'tactical', animated: false, motionAmplitude: 0 }));
}
