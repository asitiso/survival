export const NEMESIS_ADAPTATION_IDENTITY_IDS = ['spell_guard', 'blink_hunt', 'core_siege', 'enrage_clock', 'mirror_affinity'];
export const NEMESIS_ADAPTATION_IDENTITY_ATLAS = { src: './assets/ui/nemesis-adaptation-icons.png', columns: 3, rows: 2, cellSize: 96, width: 288, height: 192 };
const CELL = {
    spell_guard: [0, 0], blink_hunt: [1, 0], core_siege: [2, 0], enrage_clock: [0, 1], mirror_affinity: [1, 1],
};
const LABEL = {
    spell_guard: '주문 방벽', blink_hunt: '점멸 추적', core_siege: '코어 공성', enrage_clock: '격노 가속', mirror_affinity: '속성 반사',
};
export function nemesisAdaptationIdentityIcon(id) {
    const [column, row] = CELL[id];
    return { id, label: LABEL[id], sx: column * 96, sy: row * 96, sw: 96, sh: 96, animated: false, motionAmplitude: 0, learningToastIdentitySupported: true, bossRecallIdentitySupported: true, maxVisibleRecallIcons: 3, textFallbackPreserved: true, loadFailureBlocksGameplay: false };
}
export function auditNemesisAdaptationIdentityAtlas() {
    const icons = NEMESIS_ADAPTATION_IDENTITY_IDS.map(nemesisAdaptationIdentityIcon);
    const outOfBounds = icons.filter(icon => icon.sx < 0 || icon.sy < 0 || icon.sx + icon.sw > NEMESIS_ADAPTATION_IDENTITY_ATLAS.width || icon.sy + icon.sh > NEMESIS_ADAPTATION_IDENTITY_ATLAS.height).map(icon => icon.id);
    const uniqueCellCount = new Set(icons.map(icon => `${icon.sx}:${icon.sy}`)).size;
    const coverage = icons.length / NEMESIS_ADAPTATION_IDENTITY_IDS.length;
    return { coverage, uniqueCellCount, outOfBounds, passed: coverage === 1 && uniqueCellCount === 5 && outOfBounds.length === 0 };
}
