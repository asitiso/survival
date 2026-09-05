export const SPAWN_LANE_HYSTERESIS_DEADZONE = 18;
export const SPAWN_LANE_HYSTERESIS_MAX_SHIFT = 12;
export const SPAWN_LANE_HYSTERESIS_MERGE_DISTANCE = 96;
export const SPAWN_LANE_HYSTERESIS_EDGE_BAND = 96;
export function spawnLaneHysteresisEdge(pos, bounds) {
    const width = Math.max(1, bounds.width), height = Math.max(1, bounds.height), band = SPAWN_LANE_HYSTERESIS_EDGE_BAND;
    const candidates = [['top', Math.abs(pos.y)], ['right', Math.abs(width - pos.x)], ['bottom', Math.abs(height - pos.y)], ['left', Math.abs(pos.x)]];
    candidates.sort((a, b) => a[1] - b[1]);
    return candidates[0][1] <= band ? candidates[0][0] : 'interior';
}
export function spawnLaneHysteresisUpdate(previous, next, bounds) {
    if (previous.kind !== next.kind || previous.target !== next.target)
        return null;
    const previousEdge = spawnLaneHysteresisEdge(previous.pos, bounds), nextEdge = spawnLaneHysteresisEdge(next.pos, bounds);
    if (previousEdge !== nextEdge)
        return null;
    const dx = next.pos.x - previous.pos.x, dy = next.pos.y - previous.pos.y, distance = Math.hypot(dx, dy);
    if (distance > SPAWN_LANE_HYSTERESIS_MERGE_DISTANCE)
        return null;
    if (distance <= SPAWN_LANE_HYSTERESIS_DEADZONE)
        return { pos: { ...previous.pos }, edge: previousEdge, shift: 0 };
    if (previousEdge === 'interior' && distance > 42)
        return null;
    const shift = Math.min(SPAWN_LANE_HYSTERESIS_MAX_SHIFT, distance * .22);
    const scale = distance > 1e-6 ? shift / distance : 0;
    return { pos: { x: previous.pos.x + dx * scale, y: previous.pos.y + dy * scale }, edge: previousEdge, shift };
}
