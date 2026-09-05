import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from './config.js';
import { ELITE_AFFIXES } from './elite-affixes.js';
export const ELITE_AFFIX_IDENTITY_IDS = ELITE_AFFIXES;
export const ELITE_AFFIX_IDENTITY_ATLAS = {
    src: './assets/enemies/elite-affix-icons.png',
    columns: 3,
    rows: 2,
    cellSize: 96,
    width: 288,
    height: 192,
};
const CELL_BY_AFFIX = {
    swift: [0, 0], armored: [1, 0], regenerating: [2, 0],
    frenzied: [0, 1], commander: [1, 1], manaShield: [2, 1],
};
export function eliteAffixIdentityIcon(id) {
    const [column, row] = CELL_BY_AFFIX[id];
    return {
        id,
        sx: column * ELITE_AFFIX_IDENTITY_ATLAS.cellSize,
        sy: row * ELITE_AFFIX_IDENTITY_ATLAS.cellSize,
        sw: ELITE_AFFIX_IDENTITY_ATLAS.cellSize,
        sh: ELITE_AFFIX_IDENTITY_ATLAS.cellSize,
        animated: false,
        motionAmplitude: 0,
        textFallbackPreserved: true,
        loadFailureBlocksGameplay: false,
    };
}
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export function eliteAffixIdentityRowLayout(count, radius, world) {
    const safeCount = count >= 2 ? 2 : 1;
    const safeRadius = Number.isFinite(radius) ? radius : 34;
    const iconSize = clamp(Math.round(safeRadius * 0.52), 16, 18);
    const gap = 3;
    const step = iconSize + gap;
    const rawOffsets = safeCount === 1 ? [0] : [-step / 2, step / 2];
    const halfRow = safeCount === 1 ? iconSize / 2 : (step + iconSize) / 2;
    const centerX = clamp(Number.isFinite(world.x) ? world.x : LOGICAL_WIDTH / 2, halfRow, LOGICAL_WIDTH - halfRow);
    const desiredY = (Number.isFinite(world.y) ? world.y : LOGICAL_HEIGHT / 2) + safeRadius + 16;
    const centerY = clamp(desiredY, iconSize / 2, LOGICAL_HEIGHT - iconSize / 2);
    return {
        iconSize,
        offsetsX: rawOffsets,
        worldCentersX: rawOffsets.map((offset) => centerX + offset),
        worldCenterY: centerY,
        localCenterY: centerY - (Number.isFinite(world.y) ? world.y : LOGICAL_HEIGHT / 2),
    };
}
export function eliteAffixIdentityEmphasis(id, hpRatio, manaShieldRatio) {
    if (id === 'frenzied')
        return hpRatio <= 0.42 ? 1 : 0;
    if (id === 'manaShield')
        return manaShieldRatio > 0 ? 1 : 0;
    if (id === 'regenerating')
        return 1;
    return 0;
}
export function auditEliteAffixIdentityAtlas() {
    const cells = new Set();
    const outOfBounds = [];
    for (const id of ELITE_AFFIX_IDENTITY_IDS) {
        const [column, row] = CELL_BY_AFFIX[id];
        cells.add(`${column}:${row}`);
        if (column < 0 || row < 0 || column >= ELITE_AFFIX_IDENTITY_ATLAS.columns || row >= ELITE_AFFIX_IDENTITY_ATLAS.rows)
            outOfBounds.push(id);
    }
    const coverage = ELITE_AFFIX_IDENTITY_IDS.length === 6 ? 1 : ELITE_AFFIX_IDENTITY_IDS.length / 6;
    return {
        itemCount: ELITE_AFFIX_IDENTITY_IDS.length,
        coverage,
        uniqueCellCount: cells.size,
        outOfBounds,
        passed: coverage === 1 && cells.size === 6 && outOfBounds.length === 0,
    };
}
