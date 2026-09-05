export const SPAWN_LANE_EDGE_STACK_LABEL_SEPARATION = 48;
export const SPAWN_LANE_EDGE_STACK_SCREEN_INSET = 22;
const KIND_RANK = { regular: 0, specialist: 1, elite: 2, boss: 3 };
const TARGET_RANK = { hero: 0, core: 1 };
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
function baseLabel(cue, width, height) {
    const inset = SPAWN_LANE_EDGE_STACK_SCREEN_INSET;
    if (cue.edge === 'north')
        return { x: clamp(cue.start.x, inset, width - inset), y: inset };
    if (cue.edge === 'south')
        return { x: clamp(cue.start.x, inset, width - inset), y: height - inset };
    if (cue.edge === 'west')
        return { x: inset, y: clamp(cue.start.y, inset, height - inset) };
    return { x: width - inset, y: clamp(cue.start.y, inset, height - inset) };
}
function identitySort(a, b) {
    return TARGET_RANK[a.cue.target] - TARGET_RANK[b.cue.target] || KIND_RANK[b.cue.kind] - KIND_RANK[a.cue.kind] || a.cue.start.x - b.cue.start.x || a.cue.start.y - b.cue.start.y || a.index - b.index;
}
function along(edge, pos, amount, width, height) {
    const inset = SPAWN_LANE_EDGE_STACK_SCREEN_INSET;
    return edge === 'north' || edge === 'south'
        ? { x: clamp(pos.x + amount, inset, width - inset), y: pos.y }
        : { x: pos.x, y: clamp(pos.y + amount, inset, height - inset) };
}
function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
export function spawnLaneEdgeStackArbitration(input) {
    const width = Math.max(SPAWN_LANE_EDGE_STACK_SCREEN_INSET * 2, Number.isFinite(input.width) ? input.width : 1280);
    const height = Math.max(SPAWN_LANE_EDGE_STACK_SCREEN_INSET * 2, Number.isFinite(input.height) ? input.height : 800);
    const output = input.cues.map((cue) => ({ ...cue, start: { ...cue.start }, end: { ...cue.end }, stackSlot: 0, labelPos: baseLabel(cue, width, height), labelVisible: cue.count > 1, presentationOnly: true }));
    const edges = ['north', 'east', 'south', 'west'];
    for (const edge of edges) {
        const entries = input.cues.map((cue, index) => ({ cue, index })).filter((entry) => entry.cue.edge === edge).sort(identitySort);
        const placed = [];
        for (let slot = 0; slot < entries.length; slot++) {
            const entry = entries[slot], base = baseLabel(entry.cue, width, height);
            let chosen = base;
            if (placed.some((p) => distance(p, chosen) < SPAWN_LANE_EDGE_STACK_LABEL_SEPARATION)) {
                const direction = slot % 2 === 1 ? 1 : -1;
                const candidates = [direction, -direction, 2 * direction, -2 * direction].map((m) => along(edge, base, m * SPAWN_LANE_EDGE_STACK_LABEL_SEPARATION, width, height));
                const clean = candidates.find((candidate) => placed.every((p) => distance(p, candidate) >= SPAWN_LANE_EDGE_STACK_LABEL_SEPARATION));
                if (clean)
                    chosen = clean;
            }
            placed.push(chosen);
            const out = output[entry.index];
            out.stackSlot = slot;
            out.labelPos = chosen;
            out.labelVisible = out.count > 1;
        }
    }
    return output;
}
