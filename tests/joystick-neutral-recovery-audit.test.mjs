import test from 'node:test';
import assert from 'node:assert/strict';
import { auditJoystickNeutralRecovery } from '../dist/game/joystick-neutral-recovery-audit.js';

test('phase 1295 joystick neutral recovery audit covers cardinal diagonal reverse jitter foldable and frozen invariants',()=>{
  const audit=auditJoystickNeutralRecovery();
  assert.equal(audit.samples,25);
  assert.equal(audit.cardinalReturnSamples,4);
  assert.equal(audit.diagonalReturnSamples,4);
  assert.equal(audit.reverseSamples,4);
  assert.equal(audit.jitterSamples,4);
  assert.equal(audit.foldableSamples,4);
  assert.equal(audit.invariantSamples,5);
  assert.equal(audit.cardinalReturnPassed,true);
  assert.equal(audit.diagonalReturnPassed,true);
  assert.equal(audit.reversePassed,true);
  assert.equal(audit.jitterPassed,true);
  assert.equal(audit.foldablePassed,true);
  assert.equal(audit.passed,true);
});

test('phase 1298 neutral recovery removes the material reverse residual without changing movement constants',()=>{
  const audit=auditJoystickNeutralRecovery();
  assert.ok(audit.maxResidualBeforeRecovery>=.99);
  assert.equal(audit.maxResidualAfterRecovery,0);
  assert.ok(audit.neutralRecoveryGain>=.99);
  assert.equal(audit.maxReach,92);
  assert.equal(audit.deadzone,.12);
});

test('phase 1300 audit freezes action input balance auto targeting and persistence surfaces',()=>{
  const audit=auditJoystickNeutralRecovery();
  assert.equal(audit.actionCount,9);
  assert.equal(audit.pointerLifecyclePassed,true);
  assert.equal(audit.combatInputPassed,true);
  assert.equal(audit.manualTargetPassed,true);
  assert.equal(audit.holdReliabilityPassed,true);
  assert.equal(audit.keyboardMovementMutation,false);
  assert.equal(audit.snapshotSchemaMutation,false);
  assert.deepEqual(audit.issues,[]);
});
