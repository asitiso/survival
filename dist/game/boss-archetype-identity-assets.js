export const BOSS_ARCHETYPE_IDENTITY_IDS = ['inferno', 'summoner', 'juggernaut', 'abyssWitch', 'twinMaw', 'timeEater'];
export const BOSS_ARCHETYPE_IDENTITY_ATLAS = { src: './assets/ui/boss-archetype-icons.png', columns: 3, rows: 2, cellSize: 96, width: 288, height: 192 };
const CELL = { inferno: [0, 0], summoner: [1, 0], juggernaut: [2, 0], abyssWitch: [0, 1], twinMaw: [1, 1], timeEater: [2, 1] };
const META = { inferno: { label: 'INFERNO', accent: '#ff7a49' }, summoner: { label: 'SUMMONER', accent: '#71e7a2' }, juggernaut: { label: 'JUGGERNAUT', accent: '#ffc85e' }, abyssWitch: { label: 'ABYSS WITCH', accent: '#c977ff' }, twinMaw: { label: 'TWIN MAW', accent: '#ff6fa8' }, timeEater: { label: 'TIME EATER', accent: '#66cfff' } };
export function bossArchetypeIdentityIcon(id) { const [c, r] = CELL[id], m = META[id]; return { id, label: m.label, accent: m.accent, sx: c * 96, sy: r * 96, sw: 96, sh: 96, animated: false, motionAmplitude: 0, spawnToastIdentitySupported: true, persistentRecallIdentitySupported: true, textFallbackPreserved: true, loadFailureBlocksGameplay: false }; }
export function auditBossArchetypeIdentityAtlas() { const cells = new Set(), outOfBounds = []; for (const id of BOSS_ARCHETYPE_IDENTITY_IDS) {
    const [c, r] = CELL[id];
    cells.add(`${c}:${r}`);
    if (c < 0 || r < 0 || c >= 3 || r >= 2)
        outOfBounds.push(id);
} const coverage = BOSS_ARCHETYPE_IDENTITY_IDS.length / 6; return { itemCount: 6, coverage, uniqueCellCount: cells.size, outOfBounds, passed: coverage === 1 && cells.size === 6 && outOfBounds.length === 0 }; }
