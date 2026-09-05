import test from 'node:test';
import assert from 'node:assert/strict';
import { openingShopFastPath } from '../dist/game/opening-shop-fast-path.js';

test('phase 551 an affordable early quick recommendation is promoted above the product grid',()=>{
  const p=openingShopFastPath(55,true);
  assert.equal(p.promoteQuickBuy,true);
  assert.equal(p.position,'before-grid');
});

test('phase 552 the fast path never invents a quick purchase when no safe recommendation exists',()=>{
  assert.equal(openingShopFastPath(55,false).promoteQuickBuy,false);
});

test('phase 553 mature shop visits return to the normal layout instead of permanently training one path',()=>{
  assert.equal(openingShopFastPath(181,true).promoteQuickBuy,false);
});

test('phase 554 fast path reuses the same quick-buy control and materially reduces pointer travel',()=>{
  const p=openingShopFastPath(55,true);
  assert.equal(p.newControlCount,0);
  assert.ok(p.estimatedPointerTravelReduction>=.45);
});
