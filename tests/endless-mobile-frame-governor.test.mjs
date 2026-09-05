import test from 'node:test';
import assert from 'node:assert/strict';

import {
  advanceMobileFrameGovernor,
  createDefaultMobileFrameGovernorState,
  mobileFrameGovernorPolicy,
} from '../dist/game/endless/mobile-frame-governor.js';
import { createDefaultExtensionState, restoreExtension, serializeExtension } from '../dist/game/endless/snapshot.js';
import { auditTwelveHourRun } from '../dist/game/endless/twelve-hour-auditor.js';

function advanceMany(state, count, sample) {
  let next = state;
  for (let i = 0; i < count; i += 1) next = advanceMobileFrameGovernor(next, sample);
  return next;
}

test('phase 79 short frame spikes do not downgrade presentation quality', () => {
  const initial = createDefaultMobileFrameGovernorState();
  const afterSpike = advanceMany(initial, 45, { fps: 34, adaptivePressure: .92 });
  assert.equal(afterSpike.tier, 'full');
  assert.equal(afterSpike.transitions, 0);
});

test('phase 80 sustained pressure degrades gradually and recovery uses longer hysteresis', () => {
  let state = createDefaultMobileFrameGovernorState();
  state = advanceMany(state, 90, { fps: 39, adaptivePressure: .86 });
  assert.equal(state.tier, 'reduced');
  assert.equal(state.transitions, 1);
  state = advanceMany(state, 90, { fps: 32, adaptivePressure: .94 });
  assert.equal(state.tier, 'minimal');
  assert.equal(state.transitions, 2);
  state = advanceMany(state, 239, { fps: 59, adaptivePressure: .18 });
  assert.equal(state.tier, 'minimal');
  state = advanceMobileFrameGovernor(state, { fps: 59, adaptivePressure: .18 });
  assert.equal(state.tier, 'reduced');
  assert.equal(state.transitions, 3);
});

test('phase 80 frame governor only reduces presentation density', () => {
  assert.deepEqual(mobileFrameGovernorPolicy('full'), { visualDensity: 1, projectileVisualDensity: 1, maxQuality: 'high', particleCap:180, trailCap:72, telegraphCap:24 });
  assert.deepEqual(mobileFrameGovernorPolicy('reduced'), { visualDensity: .72, projectileVisualDensity: .68, maxQuality: 'medium', particleCap:112, trailCap:48, telegraphCap:24 });
  assert.deepEqual(mobileFrameGovernorPolicy('minimal'), { visualDensity: .48, projectileVisualDensity: .42, maxQuality: 'low', particleCap:64, trailCap:28, telegraphCap:24 });
});

test('phase 81 governor snapshot persists and old snapshots migrate to full', () => {
  const base = createDefaultExtensionState(321);
  base.frameGovernor = { tier: 'minimal', stressFrames: 17, recoveryFrames: 0, transitions: 4 };
  const restored = restoreExtension(serializeExtension(base), 9);
  assert.deepEqual(restored.frameGovernor, base.frameGovernor);

  const legacyPayload = { ...base };
  delete legacyPayload.frameGovernor;
  const migrated = restoreExtension(legacyPayload, 9);
  assert.deepEqual(migrated.frameGovernor, createDefaultMobileFrameGovernorState());
});

test('phase 82 twelve hour low-device threat-5 audit remains presentation-first and bounded', () => {
  const audit = auditTwelveHourRun('low', 5);
  assert.deepEqual(audit.checkpoints.map((point) => point.minute), [480, 600, 720]);
  assert.ok(audit.checkpoints.every((point) => point.withinGuard));
  assert.ok(audit.checkpoints.every((point) => point.enemyLogicCap === 220));
  assert.ok(audit.checkpoints.every((point) => point.governorTier === 'minimal'));
  assert.equal(audit.presentationFirst, true);
  assert.equal(audit.passed, true);
});
