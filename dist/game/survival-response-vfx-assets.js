export const SURVIVAL_RESPONSE_VFX_ATLAS = {
    src: './assets/arena/survival-response-vfx.png',
    columns: 3,
    rows: 2,
    cellSize: 128,
    width: 384,
    height: 256,
};
export const SURVIVAL_RESPONSE_VFX_KINDS = ['heroPotion', 'heroPotionBoost', 'heroGuard', 'coreHit', 'coreRecover', 'coreGuard'];
const CELL = {
    heroPotion: [0, 0], heroPotionBoost: [1, 0], heroGuard: [2, 0],
    coreHit: [0, 1], coreRecover: [1, 1], coreGuard: [2, 1],
};
export function survivalResponseVfxSprite(kind) {
    const [column, row] = CELL[kind], size = SURVIVAL_RESPONSE_VFX_ATLAS.cellSize;
    return { sx: column * size, sy: row * size, sw: size, sh: size };
}
export function auditSurvivalResponseVfxAtlas() {
    const cells = new Set(), outOfBounds = [];
    for (const kind of SURVIVAL_RESPONSE_VFX_KINDS) {
        const r = survivalResponseVfxSprite(kind);
        cells.add(`${r.sx}:${r.sy}`);
        if (r.sx < 0 || r.sy < 0 || r.sx + r.sw > SURVIVAL_RESPONSE_VFX_ATLAS.width || r.sy + r.sh > SURVIVAL_RESPONSE_VFX_ATLAS.height)
            outOfBounds.push(kind);
    }
    return { itemCount: SURVIVAL_RESPONSE_VFX_KINDS.length, uniqueCellCount: cells.size, coverage: cells.size / SURVIVAL_RESPONSE_VFX_KINDS.length, outOfBounds, passed: cells.size === SURVIVAL_RESPONSE_VFX_KINDS.length && outOfBounds.length === 0 };
}
