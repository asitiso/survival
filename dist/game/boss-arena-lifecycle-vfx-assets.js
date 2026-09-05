export const BOSS_ARENA_LIFECYCLE_VFX_ATLAS = { src: './assets/bosses/boss-arena-lifecycle-vfx.png', columns: 3, rows: 4, cellSize: 128, width: 384, height: 512 };
export const BOSS_ARENA_LIFECYCLE_VFX_KINDS = ['firePool', 'summonSigil', 'shockLane', 'cursePool', 'twinCross', 'timeZone'];
const INDEX = new Map(BOSS_ARENA_LIFECYCLE_VFX_KINDS.map((id, i) => [id, i]));
export function bossArenaLifecycleVfxSprite(kind, state) { const i = INDEX.get(kind); if (i === undefined)
    throw new Error(`Unknown boss hazard kind: ${kind}`); const slot = i + (state === 'active' ? 6 : 0), col = slot % 3, row = Math.floor(slot / 3); return { sx: col * 128, sy: row * 128, sw: 128, sh: 128, presentationOnly: true, loadFailureBlocksGameplay: false }; }
export function auditBossArenaLifecycleVfxAtlas() { const cells = new Set(), outOfBounds = []; for (const kind of BOSS_ARENA_LIFECYCLE_VFX_KINDS)
    for (const state of ['telegraph', 'active']) {
        const r = bossArenaLifecycleVfxSprite(kind, state);
        cells.add(`${r.sx}:${r.sy}`);
        if (r.sx < 0 || r.sy < 0 || r.sx + r.sw > 384 || r.sy + r.sh > 512)
            outOfBounds.push(`${kind}:${state}`);
    } return { kindCount: 6, itemCount: 12, uniqueCellCount: cells.size, coverage: cells.size / 12, outOfBounds, passed: cells.size === 12 && outOfBounds.length === 0 }; }
