export const OATH_REQUIREMENT_IDENTITY_IDS = ['slayer', 'elite_hunt', 'boss_hunt', 'arcane_flow', 'core_guard', 'endure'];
const CELL = { slayer: 0, elite_hunt: 1, boss_hunt: 2, arcane_flow: 3, core_guard: 4, endure: 5 };
const META = {
    slayer: { label: 'SLAY', accent: '#ff806f' },
    elite_hunt: { label: 'ELITE HUNT', accent: '#ffc56f' },
    boss_hunt: { label: 'BOSS HUNT', accent: '#ef8cff' },
    arcane_flow: { label: 'ARCANE CAST', accent: '#9ca8ff' },
    core_guard: { label: 'CORE GUARD', accent: '#78dcff' },
    endure: { label: 'ENDURE', accent: '#79e0ad' },
};
export const OATH_REQUIREMENT_IDENTITY_ATLAS = { src: './assets/ui/oath-requirement-icons.png', columns: 3, rows: 2, cellSize: 96, width: 288, height: 192 };
export function oathRequirementIdentityIcon(id) { const cell = CELL[id], meta = META[id]; return { id, label: meta.label, accent: meta.accent, sx: (cell % 3) * 96, sy: Math.floor(cell / 3) * 96, sw: 96, sh: 96, animated: false, motionAmplitude: 0, textFallbackPreserved: true, loadFailureBlocksGameplay: false }; }
export function auditOathRequirementIdentityAtlas() { const icons = OATH_REQUIREMENT_IDENTITY_IDS.map(oathRequirementIdentityIcon); const outOfBounds = icons.filter(i => i.sx < 0 || i.sy < 0 || i.sx + i.sw > OATH_REQUIREMENT_IDENTITY_ATLAS.width || i.sy + i.sh > OATH_REQUIREMENT_IDENTITY_ATLAS.height).map(i => i.id); const uniqueCellCount = new Set(icons.map(i => `${i.sx}:${i.sy}`)).size; const coverage = icons.length / 6; return { coverage, uniqueCellCount, outOfBounds, passed: coverage === 1 && uniqueCellCount === 6 && outOfBounds.length === 0 }; }
