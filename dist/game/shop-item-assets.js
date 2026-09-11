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
    src: './assets/ui/shop-items-enhanced.png',
    columns: 3,
    rows: 3,
    cellSize: 418,
    width: 1254,
    height: 1254,
};
export const FORGE_ITEM_ATLAS = {
    src: './assets/ui/equipment-forge-items.png',
    columns: 3,
    rows: 3,
};
const FORGE_CELL_BY_ITEM = {
    'arcane-accelerator': [0, 0], 'alchemical-blast-staff': [1, 0], 'celestial-fusion-staff': [2, 0],
    'wind-iron-armor': [0, 1], 'gravity-guardian-armor': [1, 1], 'world-tree-armor': [2, 1],
    'thunder-wisdom-seal': [0, 2], 'golden-bastion-talisman': [1, 2], 'fate-core': [2, 2],
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
export const ACCESSORY_ICON_POSITIONS = {
    'sage-amulet': '0% 0%', 'storm-ring': '100% 0%',
    'bastion-talisman': '0% 100%', 'fortune-charm': '100% 100%',
};
export function accessoryIconPosition(id) { return ACCESSORY_ICON_POSITIONS[id] ?? null; }
export function shopItemIconBackgroundPosition(id) {
    if (!isShopItemAssetId(id))
        return '50% 50%';
    const [column, row] = CELL_BY_ITEM[id];
    const x = SHOP_ITEM_ATLAS.columns <= 1 ? 0 : (column / (SHOP_ITEM_ATLAS.columns - 1)) * 100;
    const y = SHOP_ITEM_ATLAS.rows <= 1 ? 0 : (row / (SHOP_ITEM_ATLAS.rows - 1)) * 100;
    return `${x}% ${y}%`;
}
export function shopItemIconPresentation(id) {
    const visible = isShopItemAssetId(id) || accessoryIconPosition(id) !== null;
    return { visible, animated: false, motionAmplitude: 0, size: 48, compactSize: 38 };
}
export function equipmentIconPresentation(id) {
    const craftedCell = FORGE_CELL_BY_ITEM[id];
    if (craftedCell) {
        const [column, row] = craftedCell;
        return { visible: true, source: FORGE_ITEM_ATLAS.src,
            position: `${column * 50}% ${row * 50}%` };
    }
    const accessory = accessoryIconPosition(id);
    if (accessory)
        return { visible: true, source: './assets/ui/shop-accessories.png', position: accessory };
    if (isShopItemAssetId(id))
        return { visible: true, source: SHOP_ITEM_ATLAS.src, position: shopItemIconBackgroundPosition(id) };
    return { visible: false, source: '', position: '50% 50%' };
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
