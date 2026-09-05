export const SHOP_ITEM_IDS = [
    'arcane-staff',
    'rapid-wand',
    'blast-rod',
    'golden-wand',
    'iron-robe',
    'gale-cloak',
    'magnet-cloak',
    'guardian-plate',
    'healing-potion',
];
export const SHOP_ITEM_ATLAS = {
    src: './assets/ui/shop-items.png',
    columns: 3,
    rows: 3,
    cellSize: 128,
    width: 384,
    height: 384,
};
const CELL_BY_ITEM = {
    'arcane-staff': [0, 0],
    'rapid-wand': [1, 0],
    'blast-rod': [2, 0],
    'golden-wand': [0, 1],
    'iron-robe': [1, 1],
    'gale-cloak': [2, 1],
    'magnet-cloak': [0, 2],
    'guardian-plate': [1, 2],
    'healing-potion': [2, 2],
};
function isShopItemAssetId(id) {
    return Object.prototype.hasOwnProperty.call(CELL_BY_ITEM, id);
}
export function shopItemIconSprite(id) {
    if (!isShopItemAssetId(id))
        return null;
    const [column, row] = CELL_BY_ITEM[id];
    return {
        sx: column * SHOP_ITEM_ATLAS.cellSize,
        sy: row * SHOP_ITEM_ATLAS.cellSize,
        sw: SHOP_ITEM_ATLAS.cellSize,
        sh: SHOP_ITEM_ATLAS.cellSize,
    };
}
export function shopItemIconBackgroundPosition(id) {
    if (!isShopItemAssetId(id))
        return '50% 50%';
    const [column, row] = CELL_BY_ITEM[id];
    const x = SHOP_ITEM_ATLAS.columns <= 1 ? 0 : (column / (SHOP_ITEM_ATLAS.columns - 1)) * 100;
    const y = SHOP_ITEM_ATLAS.rows <= 1 ? 0 : (row / (SHOP_ITEM_ATLAS.rows - 1)) * 100;
    return `${x}% ${y}%`;
}
export function shopItemIconPresentation(id) {
    const visible = isShopItemAssetId(id);
    return { visible, animated: false, motionAmplitude: 0, size: 48, compactSize: 38 };
}
export function auditShopItemAtlas(itemIds) {
    const missing = [];
    const outOfBounds = [];
    const cells = new Set();
    for (const id of itemIds) {
        if (!isShopItemAssetId(id)) {
            missing.push(id);
            continue;
        }
        const [column, row] = CELL_BY_ITEM[id];
        cells.add(`${column}:${row}`);
        if (column < 0 || row < 0 || column >= SHOP_ITEM_ATLAS.columns || row >= SHOP_ITEM_ATLAS.rows)
            outOfBounds.push(id);
    }
    return {
        itemCount: itemIds.length,
        coverage: itemIds.length === 0 ? 1 : (itemIds.length - missing.length) / itemIds.length,
        uniqueCellCount: cells.size,
        missing,
        outOfBounds,
    };
}
