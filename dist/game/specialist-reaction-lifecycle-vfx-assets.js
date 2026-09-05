export const SPECIALIST_REACTION_LIFECYCLE_VFX_TYPES = ['shieldbearer', 'assassin', 'siegeGolem', 'nullifier'];
export const SPECIALIST_REACTION_LIFECYCLE_VFX_STATES = ['trigger', 'afterglow'];
export const SPECIALIST_REACTION_LIFECYCLE_VFX_ATLAS = { src: './assets/enemies/specialist-reaction-lifecycle-vfx.png', columns: 4, rows: 2, cellSize: 128, width: 512, height: 256 };
export function specialistReactionLifecycleVfxSprite(type, state) { const col = SPECIALIST_REACTION_LIFECYCLE_VFX_TYPES.indexOf(type), row = SPECIALIST_REACTION_LIFECYCLE_VFX_STATES.indexOf(state); if (col < 0 || row < 0)
    throw new Error(`Unknown specialist reaction lifecycle VFX: ${type}:${state}`); const s = 128; return { sx: col * s, sy: row * s, sw: s, sh: s, presentationOnly: true, loadFailureBlocksGameplay: false }; }
export function auditSpecialistReactionLifecycleVfxAtlas() { const cells = new Set(), outOfBounds = []; for (const t of SPECIALIST_REACTION_LIFECYCLE_VFX_TYPES)
    for (const state of SPECIALIST_REACTION_LIFECYCLE_VFX_STATES) {
        const r = specialistReactionLifecycleVfxSprite(t, state);
        cells.add(`${r.sx}:${r.sy}`);
        if (r.sx < 0 || r.sy < 0 || r.sx + r.sw > SPECIALIST_REACTION_LIFECYCLE_VFX_ATLAS.width || r.sy + r.sh > SPECIALIST_REACTION_LIFECYCLE_VFX_ATLAS.height)
            outOfBounds.push(`${t}:${state}`);
    } const itemCount = 8; return { specialistCount: 4, stateCount: 2, itemCount, uniqueCellCount: cells.size, coverage: cells.size / itemCount, outOfBounds, passed: cells.size === itemCount && outOfBounds.length === 0 }; }
