export const BOSS_COUNTERPLAY_REWARD_VFX_ARCHETYPES = ['inferno', 'summoner', 'juggernaut', 'abyssWitch', 'twinMaw', 'timeEater'];
export const BOSS_COUNTERPLAY_REWARD_VFX_STATES = ['burst', 'aura'];
export const BOSS_COUNTERPLAY_REWARD_VFX_ATLAS = { src: './assets/bosses/boss-counterplay-reward-vfx.png', columns: 6, rows: 2, cellSize: 128, width: 768, height: 256 };
const COL = { inferno: 0, summoner: 1, juggernaut: 2, abyssWitch: 3, twinMaw: 4, timeEater: 5 };
const ROW = { burst: 0, aura: 1 };
export function bossCounterplayRewardVfxSprite(archetype, state) { return { sx: COL[archetype] * 128, sy: ROW[state] * 128, sw: 128, sh: 128, presentationOnly: true, loadFailureBlocksGameplay: false }; }
export function auditBossCounterplayRewardVfxAtlas() { const cells = new Set(), outOfBounds = []; for (const archetype of BOSS_COUNTERPLAY_REWARD_VFX_ARCHETYPES)
    for (const state of BOSS_COUNTERPLAY_REWARD_VFX_STATES) {
        const r = bossCounterplayRewardVfxSprite(archetype, state);
        cells.add(`${r.sx}:${r.sy}`);
        if (r.sx < 0 || r.sy < 0 || r.sx + r.sw > 768 || r.sy + r.sh > 256)
            outOfBounds.push(`${archetype}:${state}`);
    } return { archetypeCount: 6, stateCount: 2, itemCount: 12, uniqueCellCount: cells.size, outOfBounds, passed: cells.size === 12 && outOfBounds.length === 0 }; }
