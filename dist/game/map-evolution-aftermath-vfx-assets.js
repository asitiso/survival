export const MAP_EVOLUTION_AFTERMATH_VFX_MAPS = ['ruinedGate', 'frozenFen', 'crystalQuarry'];
export const MAP_EVOLUTION_AFTERMATH_VFX_STAGES = [1, 2];
export const MAP_EVOLUTION_AFTERMATH_VFX_STATES = ['collapse', 'debris', 'settle'];
export const MAP_EVOLUTION_AFTERMATH_VFX_ATLAS = { src: './assets/arena/map-evolution-aftermath-vfx.png', columns: 3, rows: 6, cellSize: 128, width: 384, height: 768 };
export function mapEvolutionAftermathVfxSprite(mapId, stage, state) { const col = MAP_EVOLUTION_AFTERMATH_VFX_MAPS.indexOf(mapId), stageIndex = MAP_EVOLUTION_AFTERMATH_VFX_STAGES.indexOf(stage), stateIndex = MAP_EVOLUTION_AFTERMATH_VFX_STATES.indexOf(state); if (col < 0 || stageIndex < 0 || stateIndex < 0)
    throw new Error(`Unknown map evolution aftermath VFX: ${mapId}:${stage}:${state}`); const s = 128, row = stageIndex * 3 + stateIndex; return { sx: col * s, sy: row * s, sw: s, sh: s, presentationOnly: true, loadFailureBlocksGameplay: false }; }
export function auditMapEvolutionAftermathVfxAtlas() { const cells = new Set(), outOfBounds = []; for (const m of MAP_EVOLUTION_AFTERMATH_VFX_MAPS)
    for (const stage of MAP_EVOLUTION_AFTERMATH_VFX_STAGES)
        for (const state of MAP_EVOLUTION_AFTERMATH_VFX_STATES) {
            const r = mapEvolutionAftermathVfxSprite(m, stage, state);
            cells.add(`${r.sx}:${r.sy}`);
            if (r.sx < 0 || r.sy < 0 || r.sx + r.sw > MAP_EVOLUTION_AFTERMATH_VFX_ATLAS.width || r.sy + r.sh > MAP_EVOLUTION_AFTERMATH_VFX_ATLAS.height)
                outOfBounds.push(`${m}:${stage}:${state}`);
        } const itemCount = 18; return { mapCount: 3, stageCount: 2, stateCount: 3, itemCount, uniqueCellCount: cells.size, coverage: cells.size / itemCount, outOfBounds, passed: cells.size === itemCount && outOfBounds.length === 0 }; }
