export const RELIC_RESONANCE_IMPACT_IDENTITY_IDS = ['tier-up', 'steady', 'tier-down'];
const CELL = { 'tier-up': 0, steady: 1, 'tier-down': 2 };
const META = {
    'tier-up': { label: 'RESONANCE UP', accent: '#6cf0ae' }, steady: { label: 'RESONANCE HOLD', accent: '#8ec7ff' }, 'tier-down': { label: 'RESONANCE DOWN', accent: '#ff787e' },
};
export const RELIC_RESONANCE_IMPACT_IDENTITY_ATLAS = { src: './assets/ui/relic-resonance-impact-icons.png', columns: 3, rows: 1, cellSize: 96, width: 288, height: 96 };
export function relicResonanceImpactIdentityIcon(id) { const meta = META[id]; return { id, label: meta.label, accent: meta.accent, sx: CELL[id] * 96, sy: 0, sw: 96, sh: 96, animated: false, motionAmplitude: 0, textFallbackPreserved: true, loadFailureBlocksGameplay: false }; }
export function relicResonanceImpactIdentityStyle(id) { const cell = CELL[id]; return `--secondary-icon-image:url('${RELIC_RESONANCE_IMPACT_IDENTITY_ATLAS.src}');--secondary-icon-bg-size:300% 100%;--secondary-icon-bg-position:${(cell / 2) * 100}% 0%`; }
export function auditRelicResonanceImpactIdentityAtlas() { const icons = RELIC_RESONANCE_IMPACT_IDENTITY_IDS.map(relicResonanceImpactIdentityIcon), outOfBounds = icons.filter(icon => icon.sx < 0 || icon.sx + icon.sw > RELIC_RESONANCE_IMPACT_IDENTITY_ATLAS.width || icon.sy + icon.sh > RELIC_RESONANCE_IMPACT_IDENTITY_ATLAS.height).map(icon => icon.id), uniqueCellCount = new Set(icons.map(icon => `${icon.sx}:${icon.sy}`)).size, coverage = icons.length / 3; return { coverage, uniqueCellCount, outOfBounds, passed: coverage === 1 && uniqueCellCount === 3 && outOfBounds.length === 0 }; }
