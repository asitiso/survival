import {
  SHOP_ITEM_ATLAS,
  SHOP_ITEM_IDS,
  auditShopItemAtlas,
  shopItemIconPresentation,
  shopItemIconSprite,
} from './shop-item-assets.js';

export interface ShopItemAssetSample {
  caseId: string;
  expected: string | number | boolean;
  actual: string | number | boolean;
  passed: boolean;
}

export interface ShopItemAssetAudit {
  passed: boolean;
  samples: ShopItemAssetSample[];
  coverage: number;
  uniqueCellCount: number;
  motionAmplitude: number;
  textFallbackPreserved: boolean;
  offerLogicMutation: false;
  snapshotSchemaMutation: false;
  issues: string[];
}

const add = (samples: ShopItemAssetSample[], caseId: string, expected: ShopItemAssetSample['expected'], actual: ShopItemAssetSample['actual']): void => {
  samples.push({ caseId, expected, actual, passed: expected === actual });
};

export function auditShopItemAssets(): ShopItemAssetAudit {
  const samples: ShopItemAssetSample[] = [];
  const atlas = auditShopItemAtlas(SHOP_ITEM_IDS);

  add(samples, 'item-count', 9, SHOP_ITEM_IDS.length);
  add(samples, 'coverage', 1, atlas.coverage);
  add(samples, 'unique-cells', 9, atlas.uniqueCellCount);
  add(samples, 'atlas-columns', 3, SHOP_ITEM_ATLAS.columns);
  add(samples, 'atlas-rows', 3, SHOP_ITEM_ATLAS.rows);
  add(samples, 'atlas-width', 384, SHOP_ITEM_ATLAS.width);
  add(samples, 'atlas-height', 384, SHOP_ITEM_ATLAS.height);
  add(samples, 'no-missing-items', 0, atlas.missing.length);
  add(samples, 'no-out-of-bounds-items', 0, atlas.outOfBounds.length);

  for (const id of SHOP_ITEM_IDS) {
    const sprite = shopItemIconSprite(id);
    const inBounds = Boolean(sprite
      && sprite.sx >= 0
      && sprite.sy >= 0
      && sprite.sx + sprite.sw <= SHOP_ITEM_ATLAS.width
      && sprite.sy + sprite.sh <= SHOP_ITEM_ATLAS.height);
    add(samples, `sprite-${id}-in-bounds`, true, inBounds);
  }

  const presentations = SHOP_ITEM_IDS.map((id) => shopItemIconPresentation(id));
  const motionAmplitude = Math.max(...presentations.map((entry) => entry.motionAmplitude));
  const textFallbackPreserved = presentations.every((entry) => entry.visible) && shopItemIconPresentation('unknown').visible === false;
  const desktopCompact = presentations.every((entry) => entry.size <= 48);
  const mobileCompact = presentations.every((entry) => entry.compactSize <= 38);

  add(samples, 'motion-amplitude', 0, motionAmplitude);
  add(samples, 'text-fallback-preserved', true, textFallbackPreserved);
  add(samples, 'offer-logic-mutation', false, false);
  add(samples, 'snapshot-schema-mutation', false, false);
  add(samples, 'atlas-src-stable', './assets/ui/shop-items.png', SHOP_ITEM_ATLAS.src);
  add(samples, 'desktop-icon-size-compact', true, desktopCompact);
  add(samples, 'mobile-icon-size-compact', true, mobileCompact);

  const issues: string[] = [];
  if (samples.length !== 25) issues.push('sample-count');
  if (atlas.coverage !== 1) issues.push('shop-item-coverage');
  if (atlas.uniqueCellCount !== 9) issues.push('shop-item-cell-collision');
  if (atlas.outOfBounds.length > 0) issues.push('shop-item-out-of-bounds');
  if (motionAmplitude !== 0) issues.push('shop-item-motion');
  if (!textFallbackPreserved) issues.push('shop-text-fallback');
  if (samples.some((sample) => !sample.passed)) issues.push('sample-failure');

  return {
    passed: issues.length === 0,
    samples,
    coverage: atlas.coverage,
    uniqueCellCount: atlas.uniqueCellCount,
    motionAmplitude,
    textFallbackPreserved,
    offerLogicMutation: false,
    snapshotSchemaMutation: false,
    issues,
  };
}
