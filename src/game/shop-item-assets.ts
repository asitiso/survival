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
] as const;

export type ShopItemAssetId = typeof SHOP_ITEM_IDS[number];

export const SHOP_ITEM_ATLAS = {
  src: './assets/ui/shop-items.png',
  columns: 3,
  rows: 3,
  cellSize: 128,
  width: 384,
  height: 384,
} as const;

const CELL_BY_ITEM: Readonly<Record<ShopItemAssetId, readonly [column: number, row: number]>> = {
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

export interface ShopItemIconSprite {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export interface ShopItemIconPresentation {
  visible: boolean;
  animated: false;
  motionAmplitude: 0;
  size: number;
  compactSize: number;
}

function isShopItemAssetId(id: string): id is ShopItemAssetId {
  return Object.prototype.hasOwnProperty.call(CELL_BY_ITEM, id);
}

export function shopItemIconSprite(id: string): ShopItemIconSprite | null {
  if (!isShopItemAssetId(id)) return null;
  const [column, row] = CELL_BY_ITEM[id];
  return {
    sx: column * SHOP_ITEM_ATLAS.cellSize,
    sy: row * SHOP_ITEM_ATLAS.cellSize,
    sw: SHOP_ITEM_ATLAS.cellSize,
    sh: SHOP_ITEM_ATLAS.cellSize,
  };
}

export function shopItemIconBackgroundPosition(id: string): string {
  if (!isShopItemAssetId(id)) return '50% 50%';
  const [column, row] = CELL_BY_ITEM[id];
  const x = SHOP_ITEM_ATLAS.columns <= 1 ? 0 : (column / (SHOP_ITEM_ATLAS.columns - 1)) * 100;
  const y = SHOP_ITEM_ATLAS.rows <= 1 ? 0 : (row / (SHOP_ITEM_ATLAS.rows - 1)) * 100;
  return `${x}% ${y}%`;
}

export function shopItemIconPresentation(id: string): ShopItemIconPresentation {
  const visible = isShopItemAssetId(id);
  return { visible, animated: false, motionAmplitude: 0, size: 48, compactSize: 38 };
}

export interface ShopItemAtlasAudit {
  itemCount: number;
  coverage: number;
  uniqueCellCount: number;
  missing: string[];
  outOfBounds: string[];
}

export function auditShopItemAtlas(itemIds: readonly string[]): ShopItemAtlasAudit {
  const missing: string[] = [];
  const outOfBounds: string[] = [];
  const cells = new Set<string>();
  for (const id of itemIds) {
    if (!isShopItemAssetId(id)) {
      missing.push(id);
      continue;
    }
    const [column, row] = CELL_BY_ITEM[id];
    cells.add(`${column}:${row}`);
    if (column < 0 || row < 0 || column >= SHOP_ITEM_ATLAS.columns || row >= SHOP_ITEM_ATLAS.rows) outOfBounds.push(id);
  }
  return {
    itemCount: itemIds.length,
    coverage: itemIds.length === 0 ? 1 : (itemIds.length - missing.length) / itemIds.length,
    uniqueCellCount: cells.size,
    missing,
    outOfBounds,
  };
}
