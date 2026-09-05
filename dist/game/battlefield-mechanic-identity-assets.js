export const BATTLEFIELD_MECHANIC_IDS = ['wall', 'slow', 'crystal'];
export const BATTLEFIELD_STAGE_IDS = ['stage0', 'stage1', 'stage2'];
export const BATTLEFIELD_MECHANIC_ATLAS = { src: './assets/ui/battlefield-mechanic-icons.png', columns: 3, rows: 2, cellSize: 96, width: 288, height: 192 };
const CELL_INDEX = { wall: 0, slow: 1, crystal: 2, stage0: 3, stage1: 4, stage2: 5 };
export function battlefieldMechanicIdentityIcon(id) {
    const index = CELL_INDEX[id], cell = BATTLEFIELD_MECHANIC_ATLAS.cellSize;
    return { id, atlasSrc: BATTLEFIELD_MECHANIC_ATLAS.src, sx: (index % BATTLEFIELD_MECHANIC_ATLAS.columns) * cell, sy: Math.floor(index / BATTLEFIELD_MECHANIC_ATLAS.columns) * cell, sw: cell, sh: cell, animated: false, motionAmplitude: 0, textFallbackPreserved: true, loadFailureBlocksGameplay: false };
}
export function auditBattlefieldMechanicIdentityAtlas() {
    const ids = [...BATTLEFIELD_MECHANIC_IDS, ...BATTLEFIELD_STAGE_IDS], cells = new Set(), outOfBounds = [];
    for (const id of ids) {
        const icon = battlefieldMechanicIdentityIcon(id);
        cells.add(`${icon.sx}:${icon.sy}`);
        if (icon.sx < 0 || icon.sy < 0 || icon.sx + icon.sw > BATTLEFIELD_MECHANIC_ATLAS.width || icon.sy + icon.sh > BATTLEFIELD_MECHANIC_ATLAS.height)
            outOfBounds.push(id);
    }
    return { itemCount: ids.length, coverage: ids.length / 6, uniqueCellCount: cells.size, outOfBounds, passed: ids.length === 6 && cells.size === 6 && outOfBounds.length === 0 };
}
