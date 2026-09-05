import test from 'node:test';
import assert from 'node:assert/strict';
import { auditQuickBuyRegret } from '../dist/game/quick-buy-regret-audit.js';

test('phase 515 quick-buy regret audit covers heroes archetypes and protected gear states',()=>{
  const a=auditQuickBuyRegret(); assert.equal(a.heroCount,4); assert.equal(a.archetypeCount,4); assert.ok(a.samples.length>=64);
});
test('phase 516 quick-buy never performs a protected replacement or unaffordable purchase',()=>{
  const a=auditQuickBuyRegret(); assert.equal(a.protectedReplacementCount,0); assert.equal(a.unaffordableCount,0);
});
test('phase 517 same-item upgrades remain one-tap eligible while risky swaps stay manual',()=>{
  const a=auditQuickBuyRegret(); assert.ok(a.safeUpgradeCoverage>=.99); assert.ok(a.riskySwapBlockedRate>=.99);
});
test('phase 518 quick-buy regret audit passes with zero high-regret recommendations',()=>{
  const a=auditQuickBuyRegret(); assert.equal(a.highRegretCount,0); assert.equal(a.passed,true);
});
