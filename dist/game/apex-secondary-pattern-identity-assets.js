export const APEX_SECONDARY_PATTERN_IDS = ['inferno', 'summoner', 'juggernaut', 'abyssWitch', 'twinMaw', 'timeEater'];
export const APEX_SECONDARY_PATTERN_ATLAS = { src: './assets/bosses/apex-secondary-pattern-icons.png', columns: 3, rows: 2, cellSize: 96, width: 288, height: 192 };
const CELL = { inferno: [0, 0], summoner: [1, 0], juggernaut: [2, 0], abyssWitch: [0, 1], twinMaw: [1, 1], timeEater: [2, 1] };
const META = { inferno: { label: 'APEX · INFERNO', accent: '#ff7a49' }, summoner: { label: 'APEX · SUMMONER', accent: '#71e7a2' }, juggernaut: { label: 'APEX · JUGGERNAUT', accent: '#ffc85e' }, abyssWitch: { label: 'APEX · ABYSS', accent: '#c977ff' }, twinMaw: { label: 'APEX · TWIN MAW', accent: '#ff6fa8' }, timeEater: { label: 'APEX · TIME', accent: '#66cfff' } };
export function apexSecondaryPatternIcon(archetype) { const [c, r] = CELL[archetype], m = META[archetype]; return { archetype, label: m.label, accent: m.accent, sx: c * 96, sy: r * 96, sw: 96, sh: 96, animated: false, motionAmplitude: 0, spawnToastIdentitySupported: true, persistentRecallIdentitySupported: true, secondarySpecialIntentSupported: true, textFallbackPreserved: true, loadFailureBlocksGameplay: false }; }
export function auditApexSecondaryPatternAtlas() { const cells = new Set(), outOfBounds = []; for (const id of APEX_SECONDARY_PATTERN_IDS) {
    const [c, r] = CELL[id];
    cells.add(`${c}:${r}`);
    if (c < 0 || r < 0 || c >= 3 || r >= 2)
        outOfBounds.push(id);
} const coverage = APEX_SECONDARY_PATTERN_IDS.length / 6; return { itemCount: 6, coverage, uniqueCellCount: cells.size, outOfBounds, passed: coverage === 1 && cells.size === 6 && outOfBounds.length === 0 }; }
