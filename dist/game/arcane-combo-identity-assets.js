export const ARCANE_COMBO_IDENTITY_IDS = ['inferno-chain', 'frozen-control', 'storm-velocity', 'guardian-fortress'];
export const ARCANE_COMBO_IDENTITY_ATLAS = {
    src: './assets/ui/arcane-combo-icons.png', columns: 2, rows: 2, cellSize: 96, width: 192, height: 192,
};
const CELL = {
    'inferno-chain': [0, 0], 'frozen-control': [1, 0], 'storm-velocity': [0, 1], 'guardian-fortress': [1, 1],
};
const META = {
    'inferno-chain': { label: '잿불 연쇄', accent: '#ff7659' },
    'frozen-control': { label: '절대영도 지배', accent: '#82e8ff' },
    'storm-velocity': { label: '초전도 폭풍', accent: '#b59cff' },
    'guardian-fortress': { label: '불멸의 성채', accent: '#ffd66f' },
};
export function arcaneComboIdentityIcon(id) {
    const [c, r] = CELL[id], m = META[id], s = ARCANE_COMBO_IDENTITY_ATLAS.cellSize;
    return { id, label: m.label, accent: m.accent, sx: c * s, sy: r * s, sw: s, sh: s, hudIdentitySupported: true, tierToastIdentitySupported: true, tierBadgeSupported: true, animated: false, motionAmplitude: 0, textFallbackPreserved: true, loadFailureBlocksGameplay: false };
}
export function arcaneComboTierBadge(tier) { return tier === 1 ? 'I' : tier === 2 ? 'II' : tier === 3 ? 'III' : ''; }
export function auditArcaneComboIdentityAtlas() {
    const outOfBounds = [];
    const cells = new Set();
    for (const id of ARCANE_COMBO_IDENTITY_IDS) {
        const [c, r] = CELL[id];
        cells.add(`${c}:${r}`);
        if (c < 0 || r < 0 || c >= 2 || r >= 2)
            outOfBounds.push(id);
    }
    return { itemCount: ARCANE_COMBO_IDENTITY_IDS.length, coverage: 1, uniqueCellCount: cells.size, outOfBounds, assetSrc: ARCANE_COMBO_IDENTITY_ATLAS.src, passed: cells.size === 4 && outOfBounds.length === 0 };
}
