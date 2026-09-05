export const SYNERGY_IDENTITY_IDS = [
    'forbidden-arcana', 'broken-time', 'last-bastion', 'starbreaker', 'golden-fever', 'overclock', 'ember-dominion', 'winter-dominion', 'storm-dominion', 'oath-dominion',
];
export const SYNERGY_IDENTITY_ATLAS = {
    src: './assets/ui/synergy-icons.png', columns: 4, rows: 3, cellSize: 96, width: 384, height: 288,
};
const CELL_BY_ID = {
    'forbidden-arcana': [0, 0], 'broken-time': [1, 0], 'last-bastion': [2, 0], starbreaker: [3, 0],
    'golden-fever': [0, 1], overclock: [1, 1], 'ember-dominion': [2, 1], 'winter-dominion': [3, 1],
    'storm-dominion': [0, 2], 'oath-dominion': [1, 2],
};
const LABEL = {
    'forbidden-arcana': '금단의 비전', 'broken-time': '부서진 시간', 'last-bastion': '최후의 성채', starbreaker: '별파괴자', 'golden-fever': '황금 열병', overclock: '오버클럭', 'ember-dominion': '잿불 지배', 'winter-dominion': '겨울 지배', 'storm-dominion': '폭풍 지배', 'oath-dominion': '맹세 지배',
};
const ACCENT = {
    'forbidden-arcana': '#d98cff', 'broken-time': '#70d8ff', 'last-bastion': '#f0ca72', starbreaker: '#ff845d', 'golden-fever': '#ffd85d', overclock: '#70e5ff', 'ember-dominion': '#ff674a', 'winter-dominion': '#86e7ff', 'storm-dominion': '#ae94ff', 'oath-dominion': '#f2c96f',
};
export function synergyIdentityIcon(id) {
    const [column, row] = CELL_BY_ID[id];
    return { id, label: LABEL[id], accent: ACCENT[id], sx: column * 96, sy: row * 96, sw: 96, sh: 96, animated: false, motionAmplitude: 0, textFallbackPreserved: true, loadFailureBlocksGameplay: false };
}
export function auditSynergyIdentityAtlas() {
    const cells = new Set();
    const outOfBounds = [];
    for (const id of SYNERGY_IDENTITY_IDS) {
        const [c, r] = CELL_BY_ID[id];
        cells.add(`${c}:${r}`);
        if (c < 0 || r < 0 || c >= SYNERGY_IDENTITY_ATLAS.columns || r >= SYNERGY_IDENTITY_ATLAS.rows)
            outOfBounds.push(id);
    }
    return { count: SYNERGY_IDENTITY_IDS.length, coverage: 1, uniqueCellCount: cells.size, outOfBounds, passed: cells.size === SYNERGY_IDENTITY_IDS.length && outOfBounds.length === 0 };
}
