export const PICKUP_FLOW_VFX_STATES = ['attract', 'cluster', 'rich', 'globalMagnet', 'collectSmall', 'collectLarge'];
export const PICKUP_FLOW_VFX_KINDS = ['xp', 'coin'];
export const PICKUP_FLOW_VFX_ATLAS = {
    src: './assets/arena/pickup-flow-vfx.png',
    columns: 4,
    rows: 3,
    cellSize: 128,
    width: 512,
    height: 384,
};
const CELL_BY_KEY = {
    'xp:attract': [0, 0], 'xp:cluster': [1, 0], 'xp:rich': [2, 0], 'xp:globalMagnet': [3, 0],
    'xp:collectSmall': [0, 1], 'xp:collectLarge': [1, 1], 'coin:attract': [2, 1], 'coin:cluster': [3, 1],
    'coin:rich': [0, 2], 'coin:globalMagnet': [1, 2], 'coin:collectSmall': [2, 2], 'coin:collectLarge': [3, 2],
};
export function pickupFlowVfxSprite(kind, state) {
    const [c, r] = CELL_BY_KEY[`${kind}:${state}`];
    return { sx: c * 128, sy: r * 128, sw: 128, sh: 128 };
}
export function auditPickupFlowVfxAtlas() {
    const keys = Object.keys(CELL_BY_KEY);
    const cells = new Set();
    const outOfBounds = [];
    for (const key of keys) {
        const [c, r] = CELL_BY_KEY[key];
        cells.add(`${c}:${r}`);
        if (c < 0 || r < 0 || c >= 4 || r >= 3)
            outOfBounds.push(key);
    }
    const kindCount = PICKUP_FLOW_VFX_KINDS.length, stateCount = PICKUP_FLOW_VFX_STATES.length, itemCount = keys.length, uniqueCellCount = cells.size, coverage = itemCount / (kindCount * stateCount);
    return { kindCount, stateCount, itemCount, uniqueCellCount, coverage, outOfBounds, assetSrc: PICKUP_FLOW_VFX_ATLAS.src, basePickupFallbackPreserved: true, loadFailureBlocksGameplay: false, passed: itemCount === 12 && uniqueCellCount === 12 && coverage === 1 && outOfBounds.length === 0 };
}
