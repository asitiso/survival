import test from 'node:test';
import assert from 'node:assert/strict';
import { auditOpeningBossPrepDensity } from '../dist/game/opening-boss-prep-density-audit.js';

test('phase 575 first-boss prep density samples countdown health token and potion states',()=>{
  const a=auditOpeningBossPrepDensity();
  assert.ok(a.samples>=24);
});
test('phase 576 first-boss prep never highlights more than one existing action at once',()=>{
  const a=auditOpeningBossPrepDensity();
  assert.equal(a.maxConcurrentCues,1);
});
test('phase 577 prepared states stay silent and no early prep cue appears outside twelve seconds',()=>{
  const a=auditOpeningBossPrepDensity();
  assert.equal(a.falsePositiveCount,0);
  assert.equal(a.preparedSilenceCoverage,1);
});
test('phase 578 boss prep remains bounded to shop or potion and passes density gate',()=>{
  const a=auditOpeningBossPrepDensity();
  assert.deepEqual(a.cueActions.sort(),['potion','shop']);
  assert.equal(a.passed,true);
});
