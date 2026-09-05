export const REGULAR_ENEMY_ACTION_VFX_KINDS = ['archer', 'bomber', 'shaman'];
export const REGULAR_ENEMY_ACTION_VFX_STATES = ['telegraph', 'resolve'];
export const REGULAR_ENEMY_ACTION_VFX_ATLAS = {
    src: './assets/enemies/regular-enemy-action-vfx.png',
    columns: 3,
    rows: 2,
    cellSize: 128,
    width: 384,
    height: 256,
};
export function regularEnemyActionVfxSprite(kind, state) {
    const column = REGULAR_ENEMY_ACTION_VFX_KINDS.indexOf(kind);
    const row = REGULAR_ENEMY_ACTION_VFX_STATES.indexOf(state);
    if (column < 0 || row < 0)
        throw new Error(`Unknown regular enemy action VFX: ${kind}:${state}`);
    const size = REGULAR_ENEMY_ACTION_VFX_ATLAS.cellSize;
    return { sx: column * size, sy: row * size, sw: size, sh: size, presentationOnly: true, loadFailureBlocksGameplay: false };
}
export function auditRegularEnemyActionVfxAtlas() {
    const cells = new Set(), outOfBounds = [];
    for (const kind of REGULAR_ENEMY_ACTION_VFX_KINDS)
        for (const state of REGULAR_ENEMY_ACTION_VFX_STATES) {
            const r = regularEnemyActionVfxSprite(kind, state);
            cells.add(`${r.sx}:${r.sy}`);
            if (r.sx < 0 || r.sy < 0 || r.sx + r.sw > REGULAR_ENEMY_ACTION_VFX_ATLAS.width || r.sy + r.sh > REGULAR_ENEMY_ACTION_VFX_ATLAS.height)
                outOfBounds.push(`${kind}:${state}`);
        }
    const itemCount = REGULAR_ENEMY_ACTION_VFX_KINDS.length * REGULAR_ENEMY_ACTION_VFX_STATES.length;
    return { kindCount: REGULAR_ENEMY_ACTION_VFX_KINDS.length, stateCount: REGULAR_ENEMY_ACTION_VFX_STATES.length, itemCount, coverage: cells.size / itemCount, uniqueCellCount: cells.size, outOfBounds, passed: itemCount === 6 && cells.size === itemCount && outOfBounds.length === 0 };
}
