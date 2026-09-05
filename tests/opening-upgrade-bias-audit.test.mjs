import test from 'node:test';
import assert from 'node:assert/strict';
import { auditOpeningUpgradeBias } from '../dist/game/opening-upgrade-bias-audit.js';

test('phase 567 opening upgrade guidance samples diverse health and evolution states',()=>{
  const a=auditOpeningUpgradeBias();
  assert.ok(a.samples>=12);
  assert.ok(a.recommendedIds.length>=4);
});
test('phase 568 no single upgrade id dominates the opening recommendation audit',()=>{
  const a=auditOpeningUpgradeBias();
  assert.ok(a.maxRecommendationConcentration<=0.5);
});
test('phase 569 survival evolution offense and cadence recommendations all remain reachable',()=>{
  const a=auditOpeningUpgradeBias();
  assert.equal(a.categoryCoverage,1);
});
test('phase 570 opening upgrade guidance changes labels only and passes the bias gate',()=>{
  const a=auditOpeningUpgradeBias();
  assert.equal(a.choiceMutation,false);
  assert.equal(a.passed,true);
});
