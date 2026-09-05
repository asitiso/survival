export const ENEMY_SPRITE_TYPES = [
    'grunt', 'hound', 'brute', 'archer',
    'bomber', 'shaman', 'shieldbearer', 'assassin',
    'siegeGolem', 'nullifier', 'golden', 'elite',
];
export const ENEMY_SPRITE_ATLAS = {
    src: './assets/enemies/enemy-sprites.png',
    columns: 4,
    rows: 3,
    cellSize: 128,
    width: 512,
    height: 384,
};
const CELL_BY_TYPE = {
    grunt: [0, 0], hound: [1, 0], brute: [2, 0], archer: [3, 0],
    bomber: [0, 1], shaman: [1, 1], shieldbearer: [2, 1], assassin: [3, 1],
    siegeGolem: [0, 2], nullifier: [1, 2], golden: [2, 2], elite: [3, 2],
};
const SIZE_SCALE = {
    grunt: 2.55, hound: 2.85, brute: 2.35, archer: 2.65,
    bomber: 2.6, shaman: 2.55, shieldbearer: 2.5, assassin: 2.78,
    siegeGolem: 2.3, nullifier: 2.5, golden: 2.62, elite: 2.25,
};
export function isEnemySpriteType(type) { return type !== 'boss'; }
export function enemySpriteRect(type) {
    const [column, row] = CELL_BY_TYPE[type];
    return { sx: column * ENEMY_SPRITE_ATLAS.cellSize, sy: row * ENEMY_SPRITE_ATLAS.cellSize, sw: ENEMY_SPRITE_ATLAS.cellSize, sh: ENEMY_SPRITE_ATLAS.cellSize };
}
export function enemySpritePresentation(type, radius, atlasReady) {
    const spriteType = isEnemySpriteType(type) ? type : null;
    const safeRadius = Math.max(12, Math.min(40, Number.isFinite(radius) ? radius : 18));
    return {
        visible: Boolean(spriteType && atlasReady),
        animated: false,
        motionAmplitude: 0,
        drawSize: spriteType ? Math.round(safeRadius * SIZE_SCALE[spriteType]) : 0,
        fallbackBodyVisible: true,
    };
}
export function auditEnemySpriteAtlas(types) {
    const missing = [];
    const outOfBounds = [];
    const cells = new Set();
    for (const type of types) {
        const cell = CELL_BY_TYPE[type];
        if (!cell) {
            missing.push(type);
            continue;
        }
        const [column, row] = cell;
        cells.add(`${column}:${row}`);
        if (column < 0 || row < 0 || column >= ENEMY_SPRITE_ATLAS.columns || row >= ENEMY_SPRITE_ATLAS.rows)
            outOfBounds.push(type);
    }
    return { typeCount: types.length, coverage: types.length === 0 ? 1 : (types.length - missing.length) / types.length, uniqueCellCount: cells.size, missing, outOfBounds };
}
