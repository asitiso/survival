export const FINAL_FORM_IDENTITY_ATLAS = { src: './assets/ui/final-form-icons.png', columns: 4, rows: 3, cellSize: 96, width: 384, height: 288 };
export const FINAL_FORM_IDENTITY_IDS = [
    'solar-sovereign', 'phoenix-lord', 'volcanic-archon', 'absolute-empress',
    'winter-warden', 'crystal-oracle', 'thunder-tyrant', 'tempest-runner',
    'storm-oracle', 'radiant-king', 'oath-guardian', 'light-pilgrim',
];
const CELL = new Map(FINAL_FORM_IDENTITY_IDS.map((id, index) => [id, [index % 4, Math.floor(index / 4)]]));
const pct = (n, total) => total <= 1 ? 0 : (n / (total - 1)) * 100;
export function finalFormIdentityIcon(id) { const cell = CELL.get(id); if (!cell)
    throw new Error(`Unknown final form identity: ${id}`); const [column, row] = cell; return { id, atlasSrc: FINAL_FORM_IDENTITY_ATLAS.src, backgroundSize: '400% 300%', backgroundPosition: `${pct(column, 4)}% ${pct(row, 3)}%`, sx: column * 96, sy: row * 96, sw: 96, sh: 96, animated: false, motionAmplitude: 0, textFallbackPreserved: true }; }
export function finalFormIdentityIconStyle(id) { const i = finalFormIdentityIcon(id); return `--final-form-image:url('${i.atlasSrc}');--final-form-bg-size:${i.backgroundSize};--final-form-bg-position:${i.backgroundPosition}`; }
export function isFinalFormIdentityId(value) { return typeof value === 'string' && CELL.has(value); }
export function auditFinalFormIdentityAtlas() { const cells = new Set(); const outOfBounds = []; for (const id of FINAL_FORM_IDENTITY_IDS) {
    const [c, r] = CELL.get(id);
    cells.add(`${c}:${r}`);
    if (c < 0 || r < 0 || c >= 4 || r >= 3)
        outOfBounds.push(id);
} return { itemCount: FINAL_FORM_IDENTITY_IDS.length, coverage: FINAL_FORM_IDENTITY_IDS.length === 12 ? 1 : FINAL_FORM_IDENTITY_IDS.length / 12, uniqueCellCount: cells.size, outOfBounds, assetSrc: FINAL_FORM_IDENTITY_ATLAS.src }; }
