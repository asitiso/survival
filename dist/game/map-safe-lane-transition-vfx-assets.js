export const MAP_SAFE_LANE_TRANSITION_VFX_MAPS = ['ruinedGate', 'frozenFen', 'crystalQuarry'];
export const MAP_SAFE_LANE_TRANSITION_VFX_STATES = ['path', 'arrival'];
export const MAP_SAFE_LANE_TRANSITION_VFX_ATLAS = { src: './assets/arena/map-safe-lane-transition-vfx.png', columns: 3, rows: 2, cellSize: 128, width: 384, height: 256 };
const COL = { ruinedGate: 0, frozenFen: 1, crystalQuarry: 2 };
const ROW = { path: 0, arrival: 1 };
export function mapSafeLaneTransitionVfxSprite(mapId, state) { return { sx: COL[mapId] * 128, sy: ROW[state] * 128, sw: 128, sh: 128, presentationOnly: true, loadFailureBlocksGameplay: false }; }
export function auditMapSafeLaneTransitionVfxAtlas() { const cells = new Set(), outOfBounds = []; for (const mapId of MAP_SAFE_LANE_TRANSITION_VFX_MAPS)
    for (const state of MAP_SAFE_LANE_TRANSITION_VFX_STATES) {
        const r = mapSafeLaneTransitionVfxSprite(mapId, state);
        cells.add(`${r.sx}:${r.sy}`);
        if (r.sx < 0 || r.sy < 0 || r.sx + r.sw > MAP_SAFE_LANE_TRANSITION_VFX_ATLAS.width || r.sy + r.sh > MAP_SAFE_LANE_TRANSITION_VFX_ATLAS.height)
            outOfBounds.push(`${mapId}:${state}`);
    } return { mapCount: MAP_SAFE_LANE_TRANSITION_VFX_MAPS.length, stateCount: MAP_SAFE_LANE_TRANSITION_VFX_STATES.length, itemCount: MAP_SAFE_LANE_TRANSITION_VFX_MAPS.length * MAP_SAFE_LANE_TRANSITION_VFX_STATES.length, uniqueCellCount: cells.size, outOfBounds, passed: cells.size === 6 && outOfBounds.length === 0 }; }
