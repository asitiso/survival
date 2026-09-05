import test from 'node:test';
import assert from 'node:assert/strict';
import { auditActionHoldReliability } from '../dist/game/action-hold-reliability-audit.js';

test('phase 1255 action hold reliability audit covers jitter boundary foldable and pointer safety',()=>{
  const audit=auditActionHoldReliability();
  assert.equal(audit.samples,25);
  assert.equal(audit.jitterSamples,4);
  assert.equal(audit.boundarySamples,8);
  assert.equal(audit.foldableSamples,4);
  assert.equal(audit.pointerSafetySamples,4);
  assert.equal(audit.jitterPassed,true);
  assert.equal(audit.boundaryPassed,true);
  assert.equal(audit.foldablePassed,true);
  assert.equal(audit.pointerSafetyPassed,true);
  assert.equal(audit.passed,true);
});

test('phase 1260 action hold reliability audit freezes action balance and persistence surfaces',()=>{
  const audit=auditActionHoldReliability();
  assert.equal(audit.actionCount,9);
  assert.equal(audit.cooldownMutation,false);
  assert.equal(audit.damageMutation,false);
  assert.equal(audit.autoThroughputMutation,false);
  assert.equal(audit.snapshotSchemaMutation,false);
  assert.deepEqual(audit.issues,[]);
});
