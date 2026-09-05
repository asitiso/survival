import test from 'node:test';
import assert from 'node:assert/strict';
import { auditCombatHapticArbitration } from '../dist/game/combat-haptic-arbitration-audit.js';

test('phase 1615 deterministic combat haptic arbitration audit locks priority, merge, stale-replay, and accessibility invariants', () => {
  const audit = auditCombatHapticArbitration();
  assert.equal(audit.samples.length, 25);
  assert.equal(audit.maxDispatchPerFrame, 1);
  assert.equal(audit.criticalPriorityPreservationRate, 1);
  assert.equal(audit.dualCriticalMergeRate, 1);
  assert.equal(audit.suppressedStaleReplayCount, 0);
  assert.equal(audit.hapticDisabledDispatchCount, 0);
  assert.equal(audit.safeExitRearmRate, 1);
  assert.equal(audit.reachableActionCount, 9);
  assert.equal(audit.snapshotSchemaMutation, false);
  assert.equal(audit.passed, true);
});
