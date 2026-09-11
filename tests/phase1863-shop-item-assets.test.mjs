import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const IDS=['arcane-staff','rapid-wand','blast-rod','golden-wand','iron-robe','gale-cloak','magnet-cloak','guardian-plate','healing-potion'];

test('phase 1863 shop item atlas and asset module exist', () => {
  assert.equal(fs.existsSync(new URL('../src/game/shop-item-assets.ts', import.meta.url)), true);
  assert.equal(fs.existsSync(new URL('../assets/ui/shop-items-enhanced.png', import.meta.url)), true);
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
  assert.equal(assets.SHOP_ITEM_ATLAS.width,1254);
  assert.equal(assets.SHOP_ITEM_ATLAS.height,1254);
});


test('enhanced atlas file dimensions match every sprite cell', async () => {
 const { SHOP_ITEM_ATLAS, SHOP_ITEM_IDS, shopItemIconSprite } = await import('../dist/game/shop-item-assets.js');
 const png=fs.readFileSync(new URL('../assets/ui/shop-items-enhanced.png',import.meta.url));
 assert.equal(png.readUInt32BE(16),SHOP_ITEM_ATLAS.width);
 assert.equal(png.readUInt32BE(20),SHOP_ITEM_ATLAS.height);
 for(const id of SHOP_ITEM_IDS){const s=shopItemIconSprite(id);assert.ok(s.sx+s.sw<=SHOP_ITEM_ATLAS.width);assert.ok(s.sy+s.sh<=SHOP_ITEM_ATLAS.height);}
});
