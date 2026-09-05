export const WORLD_EVOLUTION_IDENTITY_IDS = ['stormfront', 'ruins', 'mana_bloom', 'blood_moon', 'sanctuary'];
export const WORLD_EVOLUTION_IDENTITY_ATLAS = { src: './assets/ui/world-evolution-icons.png', columns: 3, rows: 2, cellSize: 96, width: 288, height: 192 };
const CELL = {
    stormfront: [0, 0], ruins: [1, 0], mana_bloom: [2, 0], blood_moon: [0, 1], sanctuary: [1, 1],
};
const LABEL = {
    stormfront: '폭풍전선', ruins: '붕괴유적', mana_bloom: '마나개화', blood_moon: '혈월', sanctuary: '성역',
};
const ACCENT = {
    stormfront: '#62d7ff', ruins: '#d8b06a', mana_bloom: '#b48cff', blood_moon: '#ff6a73', sanctuary: '#78e8ad',
};
export function worldEvolutionIdentityIcon(id) {
    const [column, row] = CELL[id];
    return { id, label: LABEL[id], accent: ACCENT[id], sx: column * 96, sy: row * 96, sw: 96, sh: 96, animated: false, motionAmplitude: 0, evolutionToastIdentitySupported: true, persistentRecallIdentitySupported: true, maxVisibleRecallIcons: 1, textFallbackPreserved: true, loadFailureBlocksGameplay: false };
}
export function auditWorldEvolutionIdentityAtlas() {
    const icons = WORLD_EVOLUTION_IDENTITY_IDS.map(worldEvolutionIdentityIcon);
    const outOfBounds = icons.filter(icon => icon.sx < 0 || icon.sy < 0 || icon.sx + icon.sw > WORLD_EVOLUTION_IDENTITY_ATLAS.width || icon.sy + icon.sh > WORLD_EVOLUTION_IDENTITY_ATLAS.height).map(icon => icon.id);
    const uniqueCellCount = new Set(icons.map(icon => `${icon.sx}:${icon.sy}`)).size;
    const coverage = icons.length / WORLD_EVOLUTION_IDENTITY_IDS.length;
    return { coverage, uniqueCellCount, outOfBounds, passed: coverage === 1 && uniqueCellCount === 5 && outOfBounds.length === 0 };
}
