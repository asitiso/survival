export const CRYSTAL_INTERACTION_LIFECYCLE_VFX_MAPS = ['ruinedGate', 'frozenFen', 'crystalQuarry'];
export const CRYSTAL_INTERACTION_LIFECYCLE_VFX_STATES = ['charging', 'primed', 'blast', 'afterglow'];
export const CRYSTAL_INTERACTION_LIFECYCLE_VFX_ATLAS = { src: './assets/arena/crystal-interaction-lifecycle-vfx.png', columns: 3, rows: 4, cellSize: 128, width: 384, height: 512 };
export function crystalInteractionLifecycleVfxSprite(mapId, state) { const col = CRYSTAL_INTERACTION_LIFECYCLE_VFX_MAPS.indexOf(mapId), row = CRYSTAL_INTERACTION_LIFECYCLE_VFX_STATES.indexOf(state); if (col < 0 || row < 0)
    throw new Error(`Unknown crystal lifecycle VFX: ${mapId}:${state}`); const cell = 128; return { sx: col * cell, sy: row * cell, sw: cell, sh: cell, presentationOnly: true, loadFailureBlocksGameplay: false }; }
export function auditCrystalInteractionLifecycleVfxAtlas() { const cells = new Set(), outOfBounds = []; for (const m of CRYSTAL_INTERACTION_LIFECYCLE_VFX_MAPS)
    for (const s of CRYSTAL_INTERACTION_LIFECYCLE_VFX_STATES) {
        const r = crystalInteractionLifecycleVfxSprite(m, s);
        cells.add(`${r.sx}:${r.sy}`);
        if (r.sx < 0 || r.sy < 0 || r.sx + r.sw > 384 || r.sy + r.sh > 512)
            outOfBounds.push(`${m}:${s}`);
    } const itemCount = 12; return { mapCount: 3, stateCount: 4, itemCount, uniqueCellCount: cells.size, coverage: cells.size / itemCount, outOfBounds, passed: cells.size === itemCount && outOfBounds.length === 0 }; }
