import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const IDS=['arcane-staff','rapid-wand','blast-rod','golden-wand','iron-robe','gale-cloak','magnet-cloak','guardian-plate','healing-potion'];

test('phase 1863 shop item atlas and asset module exist', () => {
  assert.equal(fs.existsSync(new URL('../src/game/shop-item-assets.ts', import.meta.url)), true);
  assert.equal(fs.existsSync(new URL('../assets/ui/shop-items.png', import.meta.url)), true);
});

test('shop item atlas covers all nine item identities with unique cells', async () => {
  const assets=await import('../dist/game/shop-item-assets.js');
  const audit=assets.auditShopItemAtlas(IDS);
  assert.equal(audit.itemCount,9);
  assert.equal(audit.coverage,1);
  assert.equal(audit.uniqueCellCount,9);
  assert.equal(audit.missing.length,0);
  assert.equal(audit.outOfBounds.length,0);
  assert.equal(assets.SHOP_ITEM_ATLAS.columns,3);
  assert.equal(assets.SHOP_ITEM_ATLAS.rows,3);
  assert.equal(assets.SHOP_ITEM_ATLAS.width,384);
  assert.equal(assets.SHOP_ITEM_ATLAS.height,384);
});
