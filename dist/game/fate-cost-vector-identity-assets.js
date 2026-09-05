export const FATE_COST_VECTOR_IDS = ['horde-pressure', 'elite-frequency', 'enemy-speed', 'boss-variant', 'growth-tax'];
const CELL = { 'horde-pressure': 0, 'elite-frequency': 1, 'enemy-speed': 2, 'boss-variant': 3, 'growth-tax': 4 };
const META = {
    'horde-pressure': { label: 'HORDE+', accent: '#ff7b72' },
    'elite-frequency': { label: 'ELITE+', accent: '#ffad70' },
    'enemy-speed': { label: 'SPEED+', accent: '#ffcf72' },
    'boss-variant': { label: 'BOSS+', accent: '#ed8cff' },
    'growth-tax': { label: 'GROWTH TAX', accent: '#9da9bd' },
};
export const FATE_COST_VECTOR_ATLAS = { src: './assets/ui/fate-cost-vector-icons.png', columns: 5, rows: 1, cellSize: 96, width: 480, height: 96 };
export function fateCostVectorIcon(id) { const meta = META[id]; return { id, label: meta.label, accent: meta.accent, sx: CELL[id] * 96, sy: 0, sw: 96, sh: 96, animated: false, motionAmplitude: 0, textFallbackPreserved: true, loadFailureBlocksGameplay: false }; }
function stylePosition(cell, count) { return count <= 1 ? '0% 0%' : `${(cell / (count - 1)) * 100}% 0%`; }
export function fateCostVectorStyle(id) { const icon = fateCostVectorIcon(id); return `--fate-vector-image:url('${FATE_COST_VECTOR_ATLAS.src}');--fate-vector-bg-size:500% 100%;--fate-vector-bg-position:${stylePosition(CELL[id], 5)}`; }
export function auditFateCostVectorAtlas() { const icons = FATE_COST_VECTOR_IDS.map(fateCostVectorIcon); const outOfBounds = icons.filter(i => i.sx < 0 || i.sx + i.sw > FATE_COST_VECTOR_ATLAS.width || i.sy + i.sh > FATE_COST_VECTOR_ATLAS.height).map(i => i.id); const uniqueCellCount = new Set(icons.map(i => `${i.sx}:${i.sy}`)).size; const coverage = icons.length / 5; return { coverage, uniqueCellCount, outOfBounds, passed: coverage === 1 && uniqueCellCount === 5 && outOfBounds.length === 0 }; }
