export const FATE_BENEFIT_VECTOR_IDS = ['xp-growth', 'gold-shop', 'core-guard', 'objective-reward'];
const CELL = { 'xp-growth': 0, 'gold-shop': 1, 'core-guard': 2, 'objective-reward': 3 };
const META = {
    'xp-growth': { label: 'XP GROWTH', accent: '#8fe6ff' },
    'gold-shop': { label: 'GOLD + SHOP', accent: '#ffd66e' },
    'core-guard': { label: 'CORE GUARD', accent: '#7fe0b7' },
    'objective-reward': { label: 'OBJECTIVE+', accent: '#d0a4ff' },
};
export const FATE_BENEFIT_VECTOR_ATLAS = { src: './assets/ui/fate-benefit-vector-icons.png', columns: 4, rows: 1, cellSize: 96, width: 384, height: 96 };
export function fateBenefitVectorIcon(id) { const meta = META[id]; return { id, label: meta.label, accent: meta.accent, sx: CELL[id] * 96, sy: 0, sw: 96, sh: 96, animated: false, motionAmplitude: 0, textFallbackPreserved: true, loadFailureBlocksGameplay: false }; }
function stylePosition(cell, count) { return count <= 1 ? '0% 0%' : `${(cell / (count - 1)) * 100}% 0%`; }
export function fateBenefitVectorStyle(id) { const icon = fateBenefitVectorIcon(id); return `--fate-vector-image:url('${FATE_BENEFIT_VECTOR_ATLAS.src}');--fate-vector-bg-size:400% 100%;--fate-vector-bg-position:${stylePosition(CELL[id], 4)}`; }
export function auditFateBenefitVectorAtlas() { const icons = FATE_BENEFIT_VECTOR_IDS.map(fateBenefitVectorIcon); const outOfBounds = icons.filter(i => i.sx < 0 || i.sx + i.sw > FATE_BENEFIT_VECTOR_ATLAS.width || i.sy + i.sh > FATE_BENEFIT_VECTOR_ATLAS.height).map(i => i.id); const uniqueCellCount = new Set(icons.map(i => `${i.sx}:${i.sy}`)).size; const coverage = icons.length / 4; return { coverage, uniqueCellCount, outOfBounds, passed: coverage === 1 && uniqueCellCount === 4 && outOfBounds.length === 0 }; }
