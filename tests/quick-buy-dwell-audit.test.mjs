import test from 'node:test';
import assert from 'node:assert/strict';
import { auditQuickBuyDwell } from '../dist/game/quick-buy-dwell-audit.js';
import { collectReleaseCandidateEvidence, releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 531 quick-buy dwell audit covers hero archetype and equipment states with real recommendation rules',()=>{
  const a=auditQuickBuyDwell();
  assert.equal(a.heroCount,4);
  assert.equal(a.archetypeCount,4);
  assert.ok(a.samples.length>=64);
  assert.ok(a.quickEligibleCount>0);
});
test('phase 532 quick-buy cuts the safe purchase-and-return path from two taps to one',()=>{
  const a=auditQuickBuyDwell();
  assert.equal(a.legacyTapCount,2);
  assert.equal(a.quickTapCount,1);
  assert.ok(a.tapReduction>=.5);
});
test('phase 533 interaction-model shop dwell falls materially without making protected swaps eligible',()=>{
  const a=auditQuickBuyDwell();
  assert.ok(a.estimatedDwellReduction>=.45);
  assert.equal(a.protectedSwapExposureCount,0);
  assert.equal(a.unaffordableExposureCount,0);
});
test('phase 534 release candidate fails closed when quick-buy stops reducing safe shop dwell',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const failed={...evidence,quickBuyDwell:{...evidence.quickBuyDwell,passed:false,issues:['forced-dwell-regression']}};
  const audit=releaseCandidateAudit(failed);
  assert.equal(audit.status,'REVIEW');
  assert.ok(audit.issues.includes('quick-buy-dwell'));
});
