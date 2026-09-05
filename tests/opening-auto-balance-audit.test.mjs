import test from 'node:test';
import assert from 'node:assert/strict';
import { auditOpeningAutoBalance } from '../dist/game/opening-auto-balance-audit.js';

test('phase 563 opening AUTO balance audits all four normal spells across early checkpoints',()=>{
  const a=auditOpeningAutoBalance();
  assert.equal(a.samples,16);
  assert.equal(a.spellCount,4);
});
test('phase 564 AUTO readiness never adds a hidden damage or cooldown multiplier',()=>{
  const a=auditOpeningAutoBalance();
  assert.equal(a.maxDamageMultiplier,1);
  assert.equal(a.maxCooldownBenefit,1);
});
test('phase 565 opening AUTO convenience preserves manual override and the nine-action surface',()=>{
  const a=auditOpeningAutoBalance();
  assert.equal(a.manualOverrideCoverage,1);
  assert.equal(a.actionCount,9);
  assert.equal(a.snapshotMutation,false);
});
test('phase 566 opening AUTO balance passes without modeled survival inflation',()=>{
  const a=auditOpeningAutoBalance();
  assert.equal(a.maxSurvivalMultiplier,1);
  assert.equal(a.passed,true);
  assert.deepEqual(a.issues,[]);
});
