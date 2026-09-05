import test from 'node:test';
import assert from 'node:assert/strict';
import { auditReducedMotionAccessibility } from '../dist/game/reduced-motion-accessibility-audit.js';

test('phase 1911 deterministic reduced motion audit locks 64 samples and all twelve functional paths',()=>{
  const audit=auditReducedMotionAccessibility();
  assert.equal(audit.passed,true);
  assert.equal(audit.samples,64);
  assert.equal(audit.featureCoverage,12);
  assert.equal(audit.reducedMotionMaxVelocity,0);
  assert.equal(audit.reducedMotionMaxRadialDelta,0);
  assert.equal(audit.normalMotionPreserved,true);
  assert.equal(audit.flashIndependent,true);
  assert.equal(audit.shakeIndependent,true);
  assert.equal(audit.actionCount,9);
  assert.equal(audit.snapshotSchemaMutation,false);
});
