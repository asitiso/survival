export const FIELD_NODE_IDENTITY_KINDS = [
    'mana_well', 'sanctuary_zone', 'barricade', 'safe_corridor', 'volatile_zone',
];
export const FIELD_NODE_IDENTITY_ATLAS = {
    src: './assets/ui/field-node-icons.png', columns: 3, rows: 2, cellSize: 96, width: 288, height: 192,
};
const CELL_BY_KIND = {
    mana_well: [0, 0], sanctuary_zone: [1, 0], barricade: [2, 0], safe_corridor: [0, 1], volatile_zone: [1, 1],
};
const PRESENTATION_BY_KIND = {
    mana_well: { label: 'MANA', color: '#9b7cff' },
    sanctuary_zone: { label: 'SAFE', color: '#7ce8b7' },
    barricade: { label: 'WALL', color: '#d0b277' },
    safe_corridor: { label: 'PATH', color: '#75d8ff' },
    volatile_zone: { label: 'RISK', color: '#ff6c83' },
};
export function fieldNodeIdentityIcon(kind) {
    const [column, row] = CELL_BY_KIND[kind];
    return { kind, sx: column * 96, sy: row * 96, sw: 96, sh: 96, animated: false, motionAmplitude: 0, textFallbackPreserved: true, loadFailureBlocksGameplay: false };
}
export function fieldNodeIdentityPresentation(kind) {
    return { ...PRESENTATION_BY_KIND[kind] };
}
export function auditFieldNodeIdentityAtlas() {
    const cells = new Set();
    const outOfBounds = [];
    for (const kind of FIELD_NODE_IDENTITY_KINDS) {
        const [column, row] = CELL_BY_KIND[kind];
        cells.add(`${column}:${row}`);
        if (column < 0 || row < 0 || column >= 3 || row >= 2)
            outOfBounds.push(kind);
    }
    const coverage = FIELD_NODE_IDENTITY_KINDS.length / 5;
    return { itemCount: FIELD_NODE_IDENTITY_KINDS.length, coverage, uniqueCellCount: cells.size, outOfBounds, passed: coverage === 1 && cells.size === 5 && outOfBounds.length === 0 };
}
