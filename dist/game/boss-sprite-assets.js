export const BOSS_SPRITE_ARCHETYPES = [
    'inferno', 'summoner', 'juggernaut',
    'abyssWitch', 'twinMaw', 'timeEater',
];
export const BOSS_SPRITE_ATLAS = {
    src: './assets/bosses/boss-sprites.png',
    columns: 3,
    rows: 2,
    cellSize: 256,
    width: 768,
    height: 512,
};
const CELL_BY_ARCHETYPE = {
    inferno: [0, 0],
    summoner: [1, 0],
    juggernaut: [2, 0],
    abyssWitch: [0, 1],
    twinMaw: [1, 1],
    timeEater: [2, 1],
};
const SIZE_SCALE = {
    inferno: 2.44,
    summoner: 2.34,
    juggernaut: 2.5,
    abyssWitch: 2.38,
    twinMaw: 2.42,
    timeEater: 2.38,
};
export function bossSpriteRect(archetype) {
    const [column, row] = CELL_BY_ARCHETYPE[archetype];
    return {
        sx: column * BOSS_SPRITE_ATLAS.cellSize,
        sy: row * BOSS_SPRITE_ATLAS.cellSize,
        sw: BOSS_SPRITE_ATLAS.cellSize,
        sh: BOSS_SPRITE_ATLAS.cellSize,
    };
}
export function bossSpritePresentation(archetype, radius, atlasReady) {
    const safeRadius = Math.max(44, Math.min(72, Number.isFinite(radius) ? radius : 58));
    return {
        visible: atlasReady,
        animated: false,
        motionAmplitude: 0,
        drawSize: Math.round(safeRadius * SIZE_SCALE[archetype]),
        fallbackBodyVisible: true,
    };
}
export function auditBossSpriteAtlas(archetypes) {
    const missing = [];
    const outOfBounds = [];
    const cells = new Set();
    for (const archetype of archetypes) {
        const cell = CELL_BY_ARCHETYPE[archetype];
        if (!cell) {
            missing.push(archetype);
            continue;
        }
        const [column, row] = cell;
        cells.add(`${column}:${row}`);
        if (column < 0 || row < 0 || column >= BOSS_SPRITE_ATLAS.columns || row >= BOSS_SPRITE_ATLAS.rows)
            outOfBounds.push(archetype);
    }
    return {
        archetypeCount: archetypes.length,
        coverage: archetypes.length === 0 ? 1 : (archetypes.length - missing.length) / archetypes.length,
        uniqueCellCount: cells.size,
        missing,
        outOfBounds,
    };
}
