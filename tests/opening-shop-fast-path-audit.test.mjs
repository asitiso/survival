import test from 'node:test';
import assert from 'node:assert/strict';
import { auditOpeningShopFastPathSuccess } from '../dist/game/opening-shop-fast-path-audit.js';

test('phase 571 opening shop fast-path audit covers hero archetype and coin states',()=>{
  const a=auditOpeningShopFastPathSuccess();
  assert.ok(a.samples>=32);
  assert.equal(a.heroCount,4);
});
test('phase 572 every exposed fast-path offer is safe and affordable at click time',()=>{
  const a=auditOpeningShopFastPathSuccess();
  assert.equal(a.unsafeExposureCount,0);
  assert.equal(a.unaffordableExposureCount,0);
});
test('phase 573 actionable opening shops retain high one-tap purchase coverage',()=>{
  const a=auditOpeningShopFastPathSuccess();
  assert.ok(a.actionableCoverage>=0.85);
  assert.ok(a.estimatedSuccessfulOneTapRate>=0.85);
});
test('phase 574 fast path keeps normal card purchase available and adds no combat action',()=>{
  const a=auditOpeningShopFastPathSuccess();
  assert.equal(a.normalPurchasePreserved,true);
  assert.equal(a.actionCount,9);
  assert.equal(a.passed,true);
});
