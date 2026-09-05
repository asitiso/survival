export const MAP_COMBAT_BOUNDARY_WARNING_VFX_MAPS = ['ruinedGate', 'frozenFen', 'crystalQuarry'];
export const MAP_COMBAT_BOUNDARY_WARNING_VFX_KINDS = ['boundary', 'obstacle'];
export const MAP_COMBAT_BOUNDARY_WARNING_VFX_ATLAS = { src: './assets/arena/map-combat-boundary-warning-vfx.png', columns: 3, rows: 2, cellSize: 128, width: 384, height: 256 };
const COL = { ruinedGate: 0, frozenFen: 1, crystalQuarry: 2 };
const ROW = { boundary: 0, obstacle: 1 };
export function mapCombatBoundaryWarningVfxSprite(mapId, kind) { return { sx: COL[mapId] * 128, sy: ROW[kind] * 128, sw: 128, sh: 128, presentationOnly: true, loadFailureBlocksGameplay: false }; }
export function auditMapCombatBoundaryWarningVfxAtlas() { const cells = new Set(), outOfBounds = []; for (const mapId of MAP_COMBAT_BOUNDARY_WARNING_VFX_MAPS)
    for (const kind of MAP_COMBAT_BOUNDARY_WARNING_VFX_KINDS) {
        const r = mapCombatBoundaryWarningVfxSprite(mapId, kind);
        cells.add(`${r.sx}:${r.sy}`);
        if (r.sx < 0 || r.sy < 0 || r.sx + r.sw > MAP_COMBAT_BOUNDARY_WARNING_VFX_ATLAS.width || r.sy + r.sh > MAP_COMBAT_BOUNDARY_WARNING_VFX_ATLAS.height)
            outOfBounds.push(`${mapId}:${kind}`);
    } return { mapCount: 3, kindCount: 2, itemCount: 6, uniqueCellCount: cells.size, outOfBounds, passed: cells.size === 6 && outOfBounds.length === 0 }; }
