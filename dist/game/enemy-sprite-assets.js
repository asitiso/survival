export const ENEMY_SPRITE_TYPES = [
    'grunt', 'hound', 'brute', 'archer',
    'bomber', 'shaman', 'shieldbearer', 'assassin',
    'siegeGolem', 'nullifier', 'golden', 'elite',
];
export const ENEMY_SPRITE_ATLAS = {
    src: './assets/enemies/enemy-sprites.png',
    columns: 4,
    rows: 3,
    cellSize: 362,
    width: 1448,
    height: 1086,
};
const CELL_BY_TYPE = {
    grunt: [0, 0], hound: [1, 0], brute: [2, 0], archer: [3, 0],
    bomber: [0, 1], shaman: [1, 1], shieldbearer: [2, 1], assassin: [3, 1],
    siegeGolem: [0, 2], nullifier: [1, 2], golden: [2, 2], elite: [3, 2],
};
const SIZE_SCALE = {
    grunt: 2.78, hound: 3.05, brute: 2.55, archer: 2.85,
    bomber: 2.82, shaman: 2.75, shieldbearer: 2.70, assassin: 3.00,
    siegeGolem: 2.52, nullifier: 2.72, golden: 2.84, elite: 3.00,
};
export function isEnemySpriteType(type) { return type !== 'boss'; }
export function enemySpriteRect(type) {
    const [column, row] = CELL_BY_TYPE[type];
    return { sx: column * ENEMY_SPRITE_ATLAS.cellSize, sy: row * ENEMY_SPRITE_ATLAS.cellSize, sw: ENEMY_SPRITE_ATLAS.cellSize, sh: ENEMY_SPRITE_ATLAS.cellSize };
}
export function enemySpritePresentation(type, radius, atlasReady) {
    const spriteType = isEnemySpriteType(type) ? type : null;
    const safeRadius = Math.max(12, Math.min(40, Number.isFinite(radius) ? radius : 18));
    const visible = Boolean(spriteType && atlasReady);
    const elite = spriteType === 'elite';
    return {
        visible,
        animated: false,
        motionAmplitude: 0,
        drawSize: spriteType ? Math.round(safeRadius * SIZE_SCALE[spriteType]) : 0,
        fallbackBodyVisible: true,
        bodyAlpha: visible ? (elite ? 0.12 : 0.16) : 1,
        groundShadowScale: visible ? (elite ? 1.14 : 1.06) : 1,
        groundShadowAlphaBoost: visible ? (elite ? 0.08 : 0.03) : 0,
        imageShadowBlur: visible ? (elite ? 9 : 5) : 0,
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
