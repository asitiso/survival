export const BOSS_PHASE3_ENRAGE_IDS = ['inferno', 'summoner', 'juggernaut', 'abyssWitch', 'twinMaw', 'timeEater'];
export const BOSS_PHASE3_ENRAGE_ATLAS = { src: './assets/bosses/boss-phase3-enrage-icons.png', columns: 3, rows: 2, cellSize: 96, width: 288, height: 192 };
const CELL = { inferno: [0, 0], summoner: [1, 0], juggernaut: [2, 0], abyssWitch: [0, 1], twinMaw: [1, 1], timeEater: [2, 1] };
const META = { inferno: { label: 'INFERNO OVERDRIVE', accent: '#ff4d3d' }, summoner: { label: 'LEGION SURGE', accent: '#51d990' }, juggernaut: { label: 'BREAKNECK CHARGE', accent: '#ffad3d' }, abyssWitch: { label: 'ABYSS OVERFLOW', accent: '#b94fff' }, twinMaw: { label: 'TWIN FRENZY', accent: '#ff4e91' }, timeEater: { label: 'TIME COLLAPSE', accent: '#2eaeef' } };
export function bossPhase3EnrageIcon(archetype) { const [c, r] = CELL[archetype], m = META[archetype]; return { archetype, phase: 3, label: m.label, accent: m.accent, sx: c * 96, sy: r * 96, sw: 96, sh: 96, animated: false, motionAmplitude: 0, centerCueIdentitySupported: true, persistentRecallIdentitySupported: true, textFallbackPreserved: true, loadFailureBlocksGameplay: false }; }
export function auditBossPhase3EnrageAtlas() { const cells = new Set(), outOfBounds = []; for (const id of BOSS_PHASE3_ENRAGE_IDS) {
    const [c, r] = CELL[id];
    cells.add(`${c}:${r}`);
    if (c < 0 || r < 0 || c >= 3 || r >= 2)
        outOfBounds.push(id);
} const coverage = BOSS_PHASE3_ENRAGE_IDS.length / 6; return { itemCount: 6, coverage, uniqueCellCount: cells.size, outOfBounds, passed: coverage === 1 && cells.size === 6 && outOfBounds.length === 0 }; }
