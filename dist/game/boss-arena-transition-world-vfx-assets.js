export const BOSS_ARENA_TRANSITION_WORLD_VFX_ARCHETYPES = ['inferno', 'summoner', 'juggernaut', 'abyssWitch', 'twinMaw', 'timeEater'];
export const BOSS_ARENA_TRANSITION_WORLD_VFX_STATES = ['entrance', 'exit'];
export const BOSS_ARENA_TRANSITION_WORLD_VFX_ATLAS = { src: './assets/bosses/boss-arena-transition-world-vfx.png', columns: 6, rows: 2, cellSize: 128, width: 768, height: 256 };
const COL = { inferno: 0, summoner: 1, juggernaut: 2, abyssWitch: 3, twinMaw: 4, timeEater: 5 };
const ROW = { entrance: 0, exit: 1 };
export function bossArenaTransitionWorldVfxSprite(archetype, state) { return { sx: COL[archetype] * 128, sy: ROW[state] * 128, sw: 128, sh: 128, presentationOnly: true, loadFailureBlocksGameplay: false }; }
export function auditBossArenaTransitionWorldVfxAtlas() { const cells = new Set(), outOfBounds = []; for (const archetype of BOSS_ARENA_TRANSITION_WORLD_VFX_ARCHETYPES)
    for (const state of BOSS_ARENA_TRANSITION_WORLD_VFX_STATES) {
        const r = bossArenaTransitionWorldVfxSprite(archetype, state);
        cells.add(`${r.sx}:${r.sy}`);
        if (r.sx < 0 || r.sy < 0 || r.sx + r.sw > BOSS_ARENA_TRANSITION_WORLD_VFX_ATLAS.width || r.sy + r.sh > BOSS_ARENA_TRANSITION_WORLD_VFX_ATLAS.height)
            outOfBounds.push(`${archetype}:${state}`);
    } return { archetypeCount: 6, stateCount: 2, itemCount: 12, uniqueCellCount: cells.size, outOfBounds, passed: cells.size === 12 && outOfBounds.length === 0 }; }
