export const BOSS_SPECIAL_INTENT_IDS = ['inferno', 'summoner', 'juggernaut', 'abyssWitch', 'twinMaw', 'timeEater'];
export const BOSS_SPECIAL_INTENT_ATLAS = { src: './assets/ui/boss-special-intent-icons.png', columns: 3, rows: 2, cellSize: 96, width: 288, height: 192 };
const CELL = { inferno: [0, 0], summoner: [1, 0], juggernaut: [2, 0], abyssWitch: [0, 1], twinMaw: [1, 1], timeEater: [2, 1] };
const META = { inferno: { label: 'FLAME FAN', accent: '#ff8a55' }, summoner: { label: 'BROOD CALL', accent: '#7cf0ad' }, juggernaut: { label: 'IRON CHARGE', accent: '#ffd36a' }, abyssWitch: { label: 'VOID CURSE', accent: '#d383ff' }, twinMaw: { label: 'TWIN CROSS', accent: '#ff7fb6' }, timeEater: { label: 'TIME PRESSURE', accent: '#77d7ff' } };
export function bossSpecialIntentIcon(id) { const [c, r] = CELL[id], m = META[id]; return { id, label: m.label, accent: m.accent, sx: c * 96, sy: r * 96, sw: 96, sh: 96, animated: false, motionAmplitude: 0, countdownIdentitySupported: true, specialTelegraphIdentitySupported: true, textFallbackPreserved: true, loadFailureBlocksGameplay: false }; }
export function bossSpecialIntentSegments(specialTimer) { if (!Number.isFinite(specialTimer) || specialTimer > 1.2)
    return 0; if (specialTimer <= .4)
    return 3; if (specialTimer <= .8)
    return 2; return 1; }
export function auditBossSpecialIntentAtlas() { const cells = new Set(), outOfBounds = []; for (const id of BOSS_SPECIAL_INTENT_IDS) {
    const [c, r] = CELL[id];
    cells.add(`${c}:${r}`);
    if (c < 0 || r < 0 || c >= 3 || r >= 2)
        outOfBounds.push(id);
} const coverage = BOSS_SPECIAL_INTENT_IDS.length / 6; return { itemCount: 6, coverage, uniqueCellCount: cells.size, outOfBounds, passed: coverage === 1 && cells.size === 6 && outOfBounds.length === 0 }; }
