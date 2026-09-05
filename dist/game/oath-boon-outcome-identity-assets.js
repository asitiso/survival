export const OATH_BOON_OUTCOME_IDENTITY_IDS = ['prosperity', 'power', 'guard', 'boss'];
const CELL = { prosperity: 0, power: 1, guard: 2, boss: 3 };
const META = {
    prosperity: { label: 'GOLD +16%', accent: '#ffd66e' },
    power: { label: 'SPELL +9%', accent: '#ff8f78' },
    guard: { label: 'CORE DMG -12%', accent: '#7edcff' },
    boss: { label: 'BOSS +10%', accent: '#df9cff' },
};
export const OATH_BOON_OUTCOME_IDENTITY_ATLAS = { src: './assets/ui/oath-boon-outcome-icons.png', columns: 4, rows: 1, cellSize: 96, width: 384, height: 96 };
export function oathBoonOutcomeIdentityIcon(id) { const meta = META[id]; return { id, label: meta.label, accent: meta.accent, sx: CELL[id] * 96, sy: 0, sw: 96, sh: 96, animated: false, motionAmplitude: 0, textFallbackPreserved: true, loadFailureBlocksGameplay: false }; }
export function auditOathBoonOutcomeIdentityAtlas() { const icons = OATH_BOON_OUTCOME_IDENTITY_IDS.map(oathBoonOutcomeIdentityIcon); const outOfBounds = icons.filter(i => i.sx < 0 || i.sx + i.sw > OATH_BOON_OUTCOME_IDENTITY_ATLAS.width || i.sy + i.sh > OATH_BOON_OUTCOME_IDENTITY_ATLAS.height).map(i => i.id); const uniqueCellCount = new Set(icons.map(i => `${i.sx}:${i.sy}`)).size; const coverage = icons.length / 4; return { coverage, uniqueCellCount, outOfBounds, passed: coverage === 1 && uniqueCellCount === 4 && outOfBounds.length === 0 }; }
