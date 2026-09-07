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
export function frenziedThresholdDensityPresentation(state, input) {
    if (!state || state.phase === 'inactive')
        return { visible: false, alphaScale: 0, pulseScale: 0 };
    const stress = Math.max(0, Math.min(1, input.battlefieldStress ?? 0));
    const priority = !!input.priorityTarget;
    const capacity = Math.max(1, Math.round(4 - stress * 3));
    const visible = priority || Math.max(0, input.indexFromPriority) < capacity || state.phase === 'entered';
    let alphaScale = priority ? Math.max(.72, 1 - stress * .18) : visible ? Math.max(.42, 1 - stress * .48) : .18;
    if (state.phase === 'released')
        alphaScale *= .64;
    if (input.reducedFlash)
        alphaScale *= .72;
    return { visible, alphaScale, pulseScale: input.reducedMotion ? 0 : (visible ? 1 : .22) };
}
export function advanceFrenziedThresholdLifecycle(previous, hpRatio, dt) {
    const active = Number.isFinite(hpRatio) && hpRatio <= 0.42;
    const step = Math.max(0, Number.isFinite(dt) ? dt : 0);
    if (active) {
        if (!previous?.active)
            return { phase: 'entered', active: true, transitionTtl: .10 };
        if (previous.phase === 'entered') {
            const transitionTtl = Math.max(0, previous.transitionTtl - step);
            return transitionTtl > 0 ? { phase: 'entered', active: true, transitionTtl } : { phase: 'active', active: true, transitionTtl: 0 };
        }
        return { phase: 'active', active: true, transitionTtl: 0 };
    }
    if (previous?.active)
        return { phase: 'released', active: false, transitionTtl: .16 };
    if (previous?.phase === 'released') {
        const transitionTtl = Math.max(0, previous.transitionTtl - step);
        return transitionTtl > 0 ? { phase: 'released', active: false, transitionTtl } : { phase: 'inactive', active: false, transitionTtl: 0 };
    }
    return { phase: 'inactive', active: false, transitionTtl: 0 };
}
export function frenziedThresholdPresentation(state, reducedMotion = false, reducedFlash = false) {
    if (!state || state.phase === 'inactive')
        return { alpha: 0, radiusOffset: 8, lineWidth: 0, pulse: 0 };
    let alpha = state.phase === 'entered' ? .58 : state.phase === 'active' ? .34 : .24;
    if (state.phase === 'released')
        alpha *= Math.max(.2, Math.min(1, state.transitionTtl / .16));
    if (reducedFlash)
        alpha *= .62;
    return { alpha, radiusOffset: state.phase === 'entered' ? 13 : 10, lineWidth: state.phase === 'entered' ? 2.2 : 1.6, pulse: reducedMotion ? 0 : (state.phase === 'entered' ? 3.2 : state.phase === 'active' ? 1.8 : .8) };
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
