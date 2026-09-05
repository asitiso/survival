export const ELITE_PACK_APPROACH_FORMATION_VFX_TARGETS = ['hero', 'core'];
export const ELITE_PACK_APPROACH_FORMATION_VFX_STATES = ['approach', 'formation', 'focus'];
export const ELITE_PACK_APPROACH_FORMATION_VFX_ATLAS = { src: './assets/enemies/elite-pack-approach-formation-vfx.png', columns: 2, rows: 3, cellSize: 128, width: 256, height: 384 };
const COL = { hero: 0, core: 1 };
const ROW = { approach: 0, formation: 1, focus: 2 };
export function elitePackApproachFormationVfxSprite(target, state) { return { sx: COL[target] * 128, sy: ROW[state] * 128, sw: 128, sh: 128, presentationOnly: true, loadFailureBlocksGameplay: false }; }
export function auditElitePackApproachFormationVfxAtlas() { const cells = new Set(), outOfBounds = []; for (const target of ELITE_PACK_APPROACH_FORMATION_VFX_TARGETS)
    for (const state of ELITE_PACK_APPROACH_FORMATION_VFX_STATES) {
        const r = elitePackApproachFormationVfxSprite(target, state);
        cells.add(`${r.sx}:${r.sy}`);
        if (r.sx < 0 || r.sy < 0 || r.sx + r.sw > ELITE_PACK_APPROACH_FORMATION_VFX_ATLAS.width || r.sy + r.sh > ELITE_PACK_APPROACH_FORMATION_VFX_ATLAS.height)
            outOfBounds.push(`${target}:${state}`);
    } return { targetCount: 2, stateCount: 3, itemCount: 6, uniqueCellCount: cells.size, outOfBounds, passed: cells.size === 6 && outOfBounds.length === 0 }; }
