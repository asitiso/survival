export const HERO_METER_IDENTITY_IDS = ['arkan', 'seria', 'kain', 'edric'];
export const HERO_METER_IDENTITY_ATLAS = {
    src: './assets/ui/hero-meter-icons.png', columns: 2, rows: 2, cellSize: 96, width: 192, height: 192,
};
const CELL = {
    arkan: [0, 0], seria: [1, 0], kain: [0, 1], edric: [1, 1],
};
const META = {
    arkan: { label: '열기', activeLabel: 'INFERNO', accent: '#ff7454' },
    seria: { label: '절대영도', activeLabel: 'ABSOLUTE ZERO', accent: '#85e8ff' },
    kain: { label: '초과충전', activeLabel: 'SURGE', accent: '#b69aff' },
    edric: { label: '심판력', activeLabel: 'JUDGMENT', accent: '#ffd66f' },
};
export function heroMeterIdentityIcon(id) {
    const [c, r] = CELL[id], m = META[id], s = HERO_METER_IDENTITY_ATLAS.cellSize;
    return { id, label: m.label, activeLabel: m.activeLabel, accent: m.accent, sx: c * s, sy: r * s, sw: s, sh: s, hudIdentitySupported: true, activationToastIdentitySupported: true, activeGlowSupported: true, animated: false, motionAmplitude: 0, textFallbackPreserved: true, loadFailureBlocksGameplay: false };
}
export function auditHeroMeterIdentityAtlas() {
    const outOfBounds = [];
    const cells = new Set();
    for (const id of HERO_METER_IDENTITY_IDS) {
        const [c, r] = CELL[id];
        cells.add(`${c}:${r}`);
        if (c < 0 || r < 0 || c >= 2 || r >= 2)
            outOfBounds.push(id);
    }
    return { itemCount: HERO_METER_IDENTITY_IDS.length, coverage: 1, uniqueCellCount: cells.size, outOfBounds, assetSrc: HERO_METER_IDENTITY_ATLAS.src, passed: cells.size === 4 && outOfBounds.length === 0 };
}
