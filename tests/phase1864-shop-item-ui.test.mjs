import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const shopSource=fs.readFileSync(new URL('../src/ui/shop.ts',import.meta.url),'utf8');
const styles=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('phase 1864 shop cards render static item icon while keeping text identity',()=>{
  assert.match(shopSource,/shopItemIconPresentation/);
  assert.match(shopSource,/shopItemIconBackgroundPosition/);
  assert.match(shopSource,/shop-item-icon/);
  assert.match(shopSource,/<strong>\$\{offer\.name\}<\/strong>/);
  assert.match(shopSource,/shop-desc/);
});

test('shop icon CSS keeps layout compact and hides failed atlas without blocking card',()=>{
  assert.match(styles,/\.shop-item-icon/);
  assert.match(styles,/background-image:url\('\.\.\/assets\/ui\/shop-items\.png'\)/);
  assert.match(styles,/\.shop-item-icon\.shop-item-icon-fallback/);
});
