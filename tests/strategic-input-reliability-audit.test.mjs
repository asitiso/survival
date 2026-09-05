import test from 'node:test';
import assert from 'node:assert/strict';
import { auditStrategicInputReliability } from '../dist/game/strategic-input-reliability-audit.js';

test('phase 1335 strategic input reliability audit is deterministic and passes all release-commit scenarios',()=>{
  const a=auditStrategicInputReliability();
  const b=auditStrategicInputReliability();
  assert.deepEqual(a,b);
  assert.equal(a.passed,true);
  assert.equal(a.samples,25);
  assert.deepEqual(a.issues,[]);
});

test('phase 1336 audit covers release jitter boundary ownership cancellation and foldable behavior',()=>{
  const audit=auditStrategicInputReliability();
  assert.equal(audit.releaseSamples,2);
  assert.equal(audit.jitterSamples,4);
  assert.equal(audit.boundarySamples,4);
  assert.equal(audit.ownershipSamples,3);
  assert.equal(audit.cancelSamples,3);
  assert.equal(audit.foldableSamples,4);
  assert.equal(audit.invariantSamples,5);
  assert.equal(audit.releasePassed,true);
  assert.equal(audit.jitterPassed,true);
  assert.equal(audit.boundaryPassed,true);
  assert.equal(audit.ownershipPassed,true);
  assert.equal(audit.cancelPassed,true);
  assert.equal(audit.foldablePassed,true);
});

test('phase 1338 audit preserves existing input subsystems and frozen product invariants',()=>{
  const audit=auditStrategicInputReliability();
  assert.equal(audit.actionCount,9);
  assert.equal(audit.combatInputPassed,true);
  assert.equal(audit.manualTargetPassed,true);
  assert.equal(audit.holdReliabilityPassed,true);
  assert.equal(audit.joystickNeutralPassed,true);
  assert.equal(audit.spellImmediateMutation,false);
  assert.equal(audit.potionImmediateMutation,false);
  assert.equal(audit.keyboardImmediateMutation,false);
  assert.equal(audit.cooldownMutation,false);
  assert.equal(audit.damageMutation,false);
  assert.equal(audit.autoThroughputMutation,false);
  assert.equal(audit.economyMutation,false);
  assert.equal(audit.snapshotSchemaMutation,false);
});
