export const ASCENSION_TIER_PRESSURE_IDS = ['enemy-health', 'enemy-damage', 'spawn-pressure', 'elite-pressure', 'gold', 'mastery', 'mutator-threshold'];
const CELL = {
    'enemy-health': [0, 0], 'enemy-damage': [1, 0], 'spawn-pressure': [2, 0], 'elite-pressure': [3, 0], gold: [0, 1], mastery: [1, 1], 'mutator-threshold': [2, 1],
};
const META = {
    'enemy-health': { label: '적 체력', shortLabel: 'HP', accent: '#ec5d5c' }, 'enemy-damage': { label: '적 피해', shortLabel: '피해', accent: '#ff9d46' }, 'spawn-pressure': { label: '스폰 압박', shortLabel: '스폰', accent: '#69d3ff' }, 'elite-pressure': { label: '정예 압박', shortLabel: '정예', accent: '#cc84ff' }, gold: { label: '골드 보상', shortLabel: '골드', accent: '#ffd55b' }, mastery: { label: '숙련 보상', shortLabel: '숙련', accent: '#64ebaa' }, 'mutator-threshold': { label: '변이 획득', shortLabel: '변이', accent: '#ff6fab' },
};
export const ASCENSION_TIER_PRESSURE_ATLAS = { src: './assets/ui/ascension-tier-pressure-icons.png', columns: 4, rows: 2, cellSize: 96, width: 384, height: 192 };
export function ascensionTierPressureIdentityIcon(id) { const [c, r] = CELL[id], meta = META[id]; return { id, label: meta.label, shortLabel: meta.shortLabel, accent: meta.accent, sx: c * 96, sy: r * 96, sw: 96, sh: 96, animated: false, motionAmplitude: 0, textFallbackPreserved: true, loadFailureBlocksGameplay: false }; }
export function auditAscensionTierPressureIdentityAtlas() { const icons = ASCENSION_TIER_PRESSURE_IDS.map(ascensionTierPressureIdentityIcon), outOfBounds = icons.filter(icon => icon.sx < 0 || icon.sy < 0 || icon.sx + icon.sw > ASCENSION_TIER_PRESSURE_ATLAS.width || icon.sy + icon.sh > ASCENSION_TIER_PRESSURE_ATLAS.height).map(icon => icon.id), uniqueCellCount = new Set(icons.map(icon => `${icon.sx}:${icon.sy}`)).size, coverage = icons.length / ASCENSION_TIER_PRESSURE_IDS.length; return { coverage, uniqueCellCount, outOfBounds, passed: coverage === 1 && uniqueCellCount === ASCENSION_TIER_PRESSURE_IDS.length && outOfBounds.length === 0 }; }
