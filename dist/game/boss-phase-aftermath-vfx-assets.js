export const BOSS_PHASE_AFTERMATH_VFX_ARCHETYPES = ['inferno', 'summoner', 'juggernaut', 'abyssWitch', 'twinMaw', 'timeEater'];
export const BOSS_PHASE_AFTERMATH_VFX_PHASES = [2, 3];
export const BOSS_PHASE_AFTERMATH_VFX_STATES = ['burst', 'aftermath'];
export const BOSS_PHASE_AFTERMATH_VFX_ATLAS = { src: './assets/bosses/boss-phase-aftermath-vfx.png', columns: 6, rows: 4, cellSize: 128, width: 768, height: 512 };
export function bossPhaseAftermathVfxSprite(archetype, phase, state) { const col = BOSS_PHASE_AFTERMATH_VFX_ARCHETYPES.indexOf(archetype), phaseIndex = BOSS_PHASE_AFTERMATH_VFX_PHASES.indexOf(phase), stateIndex = BOSS_PHASE_AFTERMATH_VFX_STATES.indexOf(state); if (col < 0 || phaseIndex < 0 || stateIndex < 0)
    throw new Error(`Unknown boss phase aftermath VFX: ${archetype}:${phase}:${state}`); const s = 128, row = phaseIndex * 2 + stateIndex; return { sx: col * s, sy: row * s, sw: s, sh: s, presentationOnly: true, loadFailureBlocksGameplay: false }; }
export function auditBossPhaseAftermathVfxAtlas() { const cells = new Set(), outOfBounds = []; for (const a of BOSS_PHASE_AFTERMATH_VFX_ARCHETYPES)
    for (const phase of BOSS_PHASE_AFTERMATH_VFX_PHASES)
        for (const state of BOSS_PHASE_AFTERMATH_VFX_STATES) {
            const r = bossPhaseAftermathVfxSprite(a, phase, state);
            cells.add(`${r.sx}:${r.sy}`);
            if (r.sx < 0 || r.sy < 0 || r.sx + r.sw > BOSS_PHASE_AFTERMATH_VFX_ATLAS.width || r.sy + r.sh > BOSS_PHASE_AFTERMATH_VFX_ATLAS.height)
                outOfBounds.push(`${a}:${phase}:${state}`);
        } const itemCount = 24; return { archetypeCount: 6, phaseCount: 2, stateCount: 2, itemCount, uniqueCellCount: cells.size, coverage: cells.size / itemCount, outOfBounds, passed: cells.size === itemCount && outOfBounds.length === 0 }; }
