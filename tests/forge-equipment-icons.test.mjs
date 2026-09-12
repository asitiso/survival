import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const shop = fs.readFileSync(new URL('src/ui/shop.ts', root), 'utf8');
const assets = fs.readFileSync(new URL('src/game/shop-item-assets.ts', root), 'utf8');
const styles = fs.readFileSync(new URL('src/styles.css', root), 'utf8');

test('forge equipment slots render an item-specific visual identity', () => {
  assert.match(shop, /equipmentIconPresentation\(item\.id\)/);
  assert.match(shop, /forge-equipment-icon/);
  assert.match(shop, /shop-selected-equipment-icon/);
  assert.match(shop, /shop-recipe-result-icon/);
});

test('crafted equipment has a dedicated atlas instead of the generic fallback', () => {
  assert.match(assets, /FORGE_ITEM_ATLAS/);
  assert.match(assets, /celestial-fusion-staff/);
  assert.match(assets, /world-tree-armor/);
  assert.match(assets, /fate-core/);
  assert.match(assets, /equipment-forge-items\.png/);
});

test('accessories keep their two-column atlas scale inside the forge', () => {
  assert.match(assets, /backgroundSize: '200% 200%'/);
  assert.match(styles, /--forge-item-size/);
});

test('forge icon styling keeps rank and count readable', () => {
  assert.match(styles, /\.forge-equipment-icon/);
  assert.match(styles, /\.forge-item-count/);
  assert.match(styles, /\.shop-recipe-result-icon/);
});
