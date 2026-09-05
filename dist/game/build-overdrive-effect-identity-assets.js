export const BUILD_OVERDRIVE_EFFECT_IDS = ['spellPower', 'cooldown', 'area', 'heroGuard', 'coreGuard', 'bossDamage', 'fusionPower'];
const CELL = {
    spellPower: [0, 0], cooldown: [1, 0], area: [2, 0], heroGuard: [3, 0], coreGuard: [0, 1], bossDamage: [1, 1], fusionPower: [2, 1],
};
const META = {
    spellPower: { label: '마법 화력', accent: '#ffba67' }, cooldown: { label: '재사용시간', accent: '#67d9ff' }, area: { label: '영역', accent: '#a889ff' }, heroGuard: { label: '영웅 방어', accent: '#79e6a8' }, coreGuard: { label: '수호핵 방어', accent: '#7bc7ff' }, bossDamage: { label: '보스 피해', accent: '#ff7c70' }, fusionPower: { label: '융합 위력', accent: '#f0a5ff' },
};
export const BUILD_OVERDRIVE_EFFECT_ATLAS = { src: './assets/ui/build-overdrive-effect-icons.png', columns: 4, rows: 2, cellSize: 96, width: 384, height: 192 };
export function buildOverdriveEffectIdentityIcon(id) { const [c, r] = CELL[id], meta = META[id]; return { id, label: meta.label, accent: meta.accent, sx: c * 96, sy: r * 96, sw: 96, sh: 96, animated: false, motionAmplitude: 0, textFallbackPreserved: true, loadFailureBlocksGameplay: false }; }
export function auditBuildOverdriveEffectIdentityAtlas() { const icons = BUILD_OVERDRIVE_EFFECT_IDS.map(buildOverdriveEffectIdentityIcon), outOfBounds = icons.filter(icon => icon.sx < 0 || icon.sy < 0 || icon.sx + icon.sw > BUILD_OVERDRIVE_EFFECT_ATLAS.width || icon.sy + icon.sh > BUILD_OVERDRIVE_EFFECT_ATLAS.height).map(icon => icon.id), uniqueCellCount = new Set(icons.map(icon => `${icon.sx}:${icon.sy}`)).size, coverage = icons.length / BUILD_OVERDRIVE_EFFECT_IDS.length; return { coverage, uniqueCellCount, outOfBounds, passed: coverage === 1 && uniqueCellCount === BUILD_OVERDRIVE_EFFECT_IDS.length && outOfBounds.length === 0 }; }
