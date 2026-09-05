export const BATTLEFIELD_OBSTACLE_STATE_VFX_ATLAS = {
    src: './assets/arena/battlefield-obstacle-states.png',
    columns: 3,
    rows: 3,
    cellSize: 128,
    width: 384,
    height: 384,
};
const ROW_BY_MAP = {
    ruinedGate: 0,
    frozenFen: 1,
    crystalQuarry: 2,
};
const COLUMN_BY_STATE = {
    normal: 0,
    cracked: 1,
    broken: 2,
};
export function battlefieldObstacleStateForEvolution(stage) {
    return stage === 0 ? 'normal' : stage === 1 ? 'cracked' : 'broken';
}
export function battlefieldObstacleStateVfxSprite(mapId, state) {
    const column = COLUMN_BY_STATE[state], row = ROW_BY_MAP[mapId], size = BATTLEFIELD_OBSTACLE_STATE_VFX_ATLAS.cellSize;
    return { sx: column * size, sy: row * size, sw: size, sh: size };
}
export function auditBattlefieldObstacleStateVfxAtlas() {
    const cells = new Set(), outOfBounds = [];
    for (const mapId of Object.keys(ROW_BY_MAP)) {
        for (const state of Object.keys(COLUMN_BY_STATE)) {
            const r = battlefieldObstacleStateVfxSprite(mapId, state);
            cells.add(`${r.sx}:${r.sy}`);
            if (r.sx < 0 || r.sy < 0 || r.sx + r.sw > BATTLEFIELD_OBSTACLE_STATE_VFX_ATLAS.width || r.sy + r.sh > BATTLEFIELD_OBSTACLE_STATE_VFX_ATLAS.height)
                outOfBounds.push(`${mapId}:${state}`);
        }
    }
    return { mapCount: 3, stateCount: 3, itemCount: 9, coverage: cells.size / 9, uniqueCellCount: cells.size, outOfBounds, passed: cells.size === 9 && outOfBounds.length === 0 };
}
