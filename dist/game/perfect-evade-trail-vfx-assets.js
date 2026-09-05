export const PERFECT_EVADE_TRAIL_VFX_HEROES = ['arkan', 'seria', 'kain', 'edric'];
export const PERFECT_EVADE_TRAIL_VFX_STATES = ['escape', 'slipstream', 'success'];
export const PERFECT_EVADE_TRAIL_VFX_ATLAS = { src: './assets/heroes/perfect-evade-trail-vfx.png', columns: 4, rows: 3, cellSize: 128, width: 512, height: 384 };
const COL = { arkan: 0, seria: 1, kain: 2, edric: 3 };
const ROW = { escape: 0, slipstream: 1, success: 2 };
export function perfectEvadeTrailVfxSprite(heroId, state) { return { sx: COL[heroId] * 128, sy: ROW[state] * 128, sw: 128, sh: 128, presentationOnly: true, loadFailureBlocksGameplay: false }; }
export function auditPerfectEvadeTrailVfxAtlas() { const cells = new Set(), outOfBounds = []; for (const hero of PERFECT_EVADE_TRAIL_VFX_HEROES)
    for (const state of PERFECT_EVADE_TRAIL_VFX_STATES) {
        const r = perfectEvadeTrailVfxSprite(hero, state);
        cells.add(`${r.sx}:${r.sy}`);
        if (r.sx < 0 || r.sy < 0 || r.sx + r.sw > 512 || r.sy + r.sh > 384)
            outOfBounds.push(`${hero}:${state}`);
    } return { heroCount: 4, stateCount: 3, itemCount: 12, uniqueCellCount: cells.size, outOfBounds, passed: cells.size === 12 && outOfBounds.length === 0 }; }
