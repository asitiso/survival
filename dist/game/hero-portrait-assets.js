export const HERO_PORTRAIT_ATLAS = {
    src: './assets/ui/hero-portraits.png',
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
export function heroPortraitSprite(heroId) {
    const [column, row] = CELL_BY_HERO[heroId];
    return {
        sx: column * HERO_PORTRAIT_ATLAS.cellSize,
        sy: row * HERO_PORTRAIT_ATLAS.cellSize,
        sw: HERO_PORTRAIT_ATLAS.cellSize,
        sh: HERO_PORTRAIT_ATLAS.cellSize,
    };
}
export function heroPortraitPresentation(heroId, atlasReady) {
    const [column, row] = CELL_BY_HERO[heroId];
    return {
        visible: atlasReady,
        animated: false,
        motionAmplitude: 0,
        backgroundX: column === 0 ? '0%' : '100%',
        backgroundY: row === 0 ? '0%' : '100%',
        fallbackOrbVisible: true,
    };
}
export function auditHeroPortraitAtlas(heroIds) {
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
        if (column < 0 || row < 0 || column >= HERO_PORTRAIT_ATLAS.columns || row >= HERO_PORTRAIT_ATLAS.rows)
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
