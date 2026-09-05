export const HERO_BATTLE_SPRITE_ATLAS = {
    src: './assets/heroes/hero-battle-sprites.png',
    columns: 2,
    rows: 2,
    cellSize: 256,
    width: 512,
    height: 512,
};
const CELL_BY_HERO = {
    arkan: [0, 0],
    seria: [1, 0],
    kain: [0, 1],
    edric: [1, 1],
};
const SIZE_SCALE = {
    arkan: 4.95,
    seria: 4.9,
    kain: 4.9,
    edric: 5.1,
};
export function heroBattleSpriteRect(heroId) {
    const [column, row] = CELL_BY_HERO[heroId];
    return {
        sx: column * HERO_BATTLE_SPRITE_ATLAS.cellSize,
        sy: row * HERO_BATTLE_SPRITE_ATLAS.cellSize,
        sw: HERO_BATTLE_SPRITE_ATLAS.cellSize,
        sh: HERO_BATTLE_SPRITE_ATLAS.cellSize,
    };
}
export function heroBattleSpritePresentation(heroId, radius, atlasReady) {
    const safeRadius = Math.max(18, Math.min(28, Number.isFinite(radius) ? radius : 23));
    return {
        visible: atlasReady,
        animated: false,
        motionAmplitude: 0,
        drawSize: Math.round(safeRadius * SIZE_SCALE[heroId]),
        fallbackBodyVisible: true,
    };
}
export function auditHeroBattleSpriteAtlas(heroIds) {
    const missing = [];
    const outOfBounds = [];
    const cells = new Set();
    for (const heroId of heroIds) {
        const cell = CELL_BY_HERO[heroId];
        if (!cell) {
            missing.push(heroId);
            continue;
        }
        const [column, row] = cell;
        cells.add(`${column}:${row}`);
        if (column < 0 || row < 0 || column >= HERO_BATTLE_SPRITE_ATLAS.columns || row >= HERO_BATTLE_SPRITE_ATLAS.rows)
            outOfBounds.push(heroId);
    }
    return {
        heroCount: heroIds.length,
        coverage: heroIds.length === 0 ? 1 : (heroIds.length - missing.length) / heroIds.length,
        uniqueCellCount: cells.size,
        missing,
        outOfBounds,
    };
}
