import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from './config.js';
import { spawnLaneHysteresisUpdate } from './spawn-lane-hysteresis.js';
export const SPAWN_LANE_MEMORY_SECONDS = 1.35;
export const SPAWN_LANE_MEMORY_LIMIT = 12;
const RANK = { regular: 0, specialist: 1, elite: 2, boss: 3 };
export function advanceSpawnLaneMemory(memory, dt) {
    const delta = Math.max(0, Number.isFinite(dt) ? dt : 0);
    return memory.map((entry) => ({ ...entry, pos: { ...entry.pos }, ttl: entry.ttl - delta })).filter((entry) => entry.ttl > 0);
}
export function rememberSpawnLanePortal(memory, portal) {
    const next = memory.map((entry) => ({ ...entry, pos: { ...entry.pos } }));
    let match = -1, best = Infinity;
    for (let i = 0; i < next.length; i++) {
        const entry = next[i];
        if (entry.kind !== portal.kind || entry.target !== portal.target)
            continue;
        const d = Math.hypot(entry.pos.x - portal.pos.x, entry.pos.y - portal.pos.y);
        const update = d <= 42 ? { pos: entry.pos } : spawnLaneHysteresisUpdate(entry, portal, { width: LOGICAL_WIDTH, height: LOGICAL_HEIGHT });
        if (!update)
            continue;
        if (d < best) {
            match = i;
            best = d;
        }
    }
    if (match >= 0) {
        const entry = next[match];
        const d = Math.hypot(entry.pos.x - portal.pos.x, entry.pos.y - portal.pos.y);
        if (d <= 42)
            entry.pos = { x: (entry.pos.x + portal.pos.x) / 2, y: (entry.pos.y + portal.pos.y) / 2 };
        else
            entry.pos = spawnLaneHysteresisUpdate(entry, portal, { width: LOGICAL_WIDTH, height: LOGICAL_HEIGHT }).pos;
        entry.ttl = SPAWN_LANE_MEMORY_SECONDS;
    }
    else
        next.push({ pos: { ...portal.pos }, kind: portal.kind, target: portal.target, ttl: SPAWN_LANE_MEMORY_SECONDS });
    return next.sort((a, b) => RANK[b.kind] - RANK[a.kind] || b.ttl - a.ttl).slice(0, SPAWN_LANE_MEMORY_LIMIT);
}
