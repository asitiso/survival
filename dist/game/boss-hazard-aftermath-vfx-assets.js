export const BOSS_HAZARD_AFTERMATH_VFX_KINDS = ['firePool', 'summonSigil', 'shockLane', 'cursePool', 'twinCross', 'timeZone'];
export const BOSS_HAZARD_AFTERMATH_VFX_STATES = ['detonate', 'residual'];
export const BOSS_HAZARD_AFTERMATH_VFX_ATLAS = { src: './assets/bosses/boss-hazard-aftermath-vfx.png', columns: 3, rows: 4, cellSize: 128, width: 384, height: 512 };
export function bossHazardAftermathVfxSprite(kind, state) { const i = BOSS_HAZARD_AFTERMATH_VFX_KINDS.indexOf(kind), s = BOSS_HAZARD_AFTERMATH_VFX_STATES.indexOf(state); if (i < 0 || s < 0)
    throw new Error(`Unknown boss hazard aftermath VFX: ${kind}:${state}`); const size = 128, col = i % 3, row = Math.floor(i / 3) * 2 + s; return { sx: col * size, sy: row * size, sw: size, sh: size, presentationOnly: true, loadFailureBlocksGameplay: false }; }
export function auditBossHazardAftermathVfxAtlas() { const cells = new Set(), outOfBounds = []; for (const kind of BOSS_HAZARD_AFTERMATH_VFX_KINDS)
    for (const state of BOSS_HAZARD_AFTERMATH_VFX_STATES) {
        const r = bossHazardAftermathVfxSprite(kind, state);
        cells.add(`${r.sx}:${r.sy}`);
        if (r.sx < 0 || r.sy < 0 || r.sx + r.sw > BOSS_HAZARD_AFTERMATH_VFX_ATLAS.width || r.sy + r.sh > BOSS_HAZARD_AFTERMATH_VFX_ATLAS.height)
            outOfBounds.push(`${kind}:${state}`);
    } const itemCount = 12; return { hazardCount: 6, stateCount: 2, itemCount, uniqueCellCount: cells.size, coverage: cells.size / itemCount, outOfBounds, passed: cells.size === itemCount && outOfBounds.length === 0 }; }
