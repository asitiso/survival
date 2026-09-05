import test from 'node:test';
import assert from 'node:assert/strict';
import { arbitrateCombatHaptics } from '../dist/game/combat-haptic-arbitration.js';

test('phase 1583-1590 frame arbitration dispatches at most one highest-priority haptic', () => {
  const result = arbitrateCombatHaptics(['bossCountdown', 'bossPhase', 'heroCritical']);
  assert.equal(result.kind, 'heroCritical');
  assert.equal(result.dispatchCount, 1);
  assert.deepEqual(result.acknowledged, ['heroCritical']);
});

test('phase 1591-1598 hero and core critical merge into one dual-critical pattern', () => {
  const result = arbitrateCombatHaptics(['heroCritical', 'coreCritical']);
  assert.equal(result.kind, 'dualCritical');
  assert.equal(result.dispatchCount, 1);
  assert.deepEqual(result.acknowledged.sort(), ['coreCritical', 'heroCritical']);
  assert.deepEqual(result.pattern, [45, 30, 75, 30, 45]);
});

test('phase 1599-1606 boss phase 3 outranks ordinary boss phase and countdown', () => {
  const result = arbitrateCombatHaptics(['bossCountdown', 'bossPhase', 'bossPhase3']);
  assert.equal(result.kind, 'bossPhase3');
  assert.equal(result.dispatchCount, 1);
  assert.deepEqual(result.pattern, [35, 25, 70]);
});

test('phase 1607 haptic disabled hard-bypasses every queued intent', () => {
  const result = arbitrateCombatHaptics(['heroCritical', 'bossPhase3'], false);
  assert.equal(result.kind, null);
  assert.equal(result.dispatchCount, 0);
  assert.equal(result.pattern, null);
});

test('phase 1607-1614 frame arbiter clears resolved and lifecycle-suppressed intents without stale replay', async () => {
  const { CombatHapticArbiter } = await import('../dist/game/combat-haptic-arbitration.js');
  const arbiter = new CombatHapticArbiter();
  arbiter.queue('bossCountdown');
  arbiter.queue('heroCritical');
  assert.equal(arbiter.pendingCount, 2);
  assert.equal(arbiter.resolve(true).kind, 'heroCritical');
  assert.equal(arbiter.pendingCount, 0);
  assert.equal(arbiter.resolve(true).dispatchCount, 0);
  arbiter.queue('bossPhase3');
  arbiter.clear();
  assert.equal(arbiter.pendingCount, 0);
  assert.equal(arbiter.resolve(true).dispatchCount, 0);
});
