export const BOSS_PHASE2_ESCALATION_IDS = ['inferno', 'summoner', 'juggernaut', 'abyssWitch', 'twinMaw', 'timeEater'];
export const BOSS_PHASE2_ESCALATION_ATLAS = { src: './assets/bosses/boss-phase2-escalation-icons.png', columns: 3, rows: 2, cellSize: 96, width: 288, height: 192 };
const CELL = { inferno: [0, 0], summoner: [1, 0], juggernaut: [2, 0], abyssWitch: [0, 1], twinMaw: [1, 1], timeEater: [2, 1] };
const META = { inferno: { label: 'RING BARRAGE +', accent: '#ff793f' }, summoner: { label: 'SUMMON WAVE +', accent: '#6ee5a4' }, juggernaut: { label: 'CHARGE RANGE +', accent: '#ffc34f' }, abyssWitch: { label: 'CURSE RING +', accent: '#ca68ff' }, twinMaw: { label: 'CROSS FAN +', accent: '#ff679f' }, timeEater: { label: 'TIME PRESSURE +', accent: '#4dbef8' } };
export function bossPhase2EscalationIcon(archetype) { const [c, r] = CELL[archetype], m = META[archetype]; return { archetype, phase: 2, label: m.label, accent: m.accent, sx: c * 96, sy: r * 96, sw: 96, sh: 96, animated: false, motionAmplitude: 0, centerCueIdentitySupported: true, persistentRecallIdentitySupported: true, textFallbackPreserved: true, loadFailureBlocksGameplay: false }; }
export function auditBossPhase2EscalationAtlas() { const cells = new Set(), outOfBounds = []; for (const id of BOSS_PHASE2_ESCALATION_IDS) {
    const [c, r] = CELL[id];
    cells.add(`${c}:${r}`);
    if (c < 0 || r < 0 || c >= 3 || r >= 2)
        outOfBounds.push(id);
} const coverage = BOSS_PHASE2_ESCALATION_IDS.length / 6; return { itemCount: 6, coverage, uniqueCellCount: cells.size, outOfBounds, passed: coverage === 1 && cells.size === 6 && outOfBounds.length === 0 }; }
