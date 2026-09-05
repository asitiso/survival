export const BATTLEFIELD_PROP_VFX_ATLAS = {
    src: './assets/arena/battlefield-props-vfx.png',
    columns: 3,
    rows: 4,
    cellSize: 128,
    width: 384,
    height: 512,
};
const WALL_CELL_BY_MAP = {
    ruinedGate: [0, 0],
    frozenFen: [1, 0],
    crystalQuarry: [2, 0],
};
const CRYSTAL_CELL_BY_MAP = {
    ruinedGate: [0, 1],
    frozenFen: [1, 1],
    crystalQuarry: [2, 1],
};
const VFX_CELL_BY_ID = {
    fireBolt: [0, 2],
    chainLightning: [1, 2],
    frostNova: [2, 2],
    flameField: [0, 3],
    meteorStorm: [1, 3],
    blackHole: [2, 3],
};
function cellRect(column, row) {
    return {
        sx: column * BATTLEFIELD_PROP_VFX_ATLAS.cellSize,
        sy: row * BATTLEFIELD_PROP_VFX_ATLAS.cellSize,
        sw: BATTLEFIELD_PROP_VFX_ATLAS.cellSize,
        sh: BATTLEFIELD_PROP_VFX_ATLAS.cellSize,
    };
}
export function battlefieldPropSprite(mapId, kind) {
    const [column, row] = kind === 'wall' ? WALL_CELL_BY_MAP[mapId] : CRYSTAL_CELL_BY_MAP[mapId];
    return cellRect(column, row);
}
export function battlefieldSpellVfxSprite(id) {
    const [column, row] = VFX_CELL_BY_ID[id];
    return cellRect(column, row);
}
export function auditBattlefieldPropVfxAtlas() {
    const cells = new Set();
    const outOfBounds = [];
    for (const mapId of Object.keys(WALL_CELL_BY_MAP)) {
        for (const kind of ['wall', 'crystal']) {
            const sprite = battlefieldPropSprite(mapId, kind);
            cells.add(`${sprite.sx}:${sprite.sy}`);
            if (sprite.sx < 0 || sprite.sy < 0 || sprite.sx + sprite.sw > BATTLEFIELD_PROP_VFX_ATLAS.width || sprite.sy + sprite.sh > BATTLEFIELD_PROP_VFX_ATLAS.height)
                outOfBounds.push(`${kind}:${mapId}`);
        }
    }
    for (const id of Object.keys(VFX_CELL_BY_ID)) {
        const sprite = battlefieldSpellVfxSprite(id);
        cells.add(`${sprite.sx}:${sprite.sy}`);
        if (sprite.sx < 0 || sprite.sy < 0 || sprite.sx + sprite.sw > BATTLEFIELD_PROP_VFX_ATLAS.width || sprite.sy + sprite.sh > BATTLEFIELD_PROP_VFX_ATLAS.height)
            outOfBounds.push(`vfx:${id}`);
    }
    const itemCount = 12;
    return {
        itemCount,
        coverage: cells.size / itemCount,
        uniqueCellCount: cells.size,
        outOfBounds,
        assetSrc: BATTLEFIELD_PROP_VFX_ATLAS.src,
        passed: cells.size === itemCount && outOfBounds.length === 0,
    };
}
