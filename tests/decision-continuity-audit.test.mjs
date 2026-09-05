import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const moduleUrl = new URL('../dist/game/decision-continuity-audit.js', import.meta.url);

async function loadAudit() {
  assert.equal(fs.existsSync(fileURLToPath(moduleUrl)), true, 'decision continuity audit module should exist');
  return import(moduleUrl.href);
}

test('phase 1135 decision continuity audit is deterministic and release-safe', async () => {
  const { auditDecisionContinuity } = await loadAudit();
  const first = auditDecisionContinuity();
  const second = auditDecisionContinuity();
  assert.deepEqual(second, first);
  assert.equal(first.passed, true);
  assert.deepEqual(first.issues, []);
});

test('phase 1136 audit covers the frozen decision priority plus empty state', async () => {
  const { auditDecisionContinuity } = await loadAudit();
  const audit = auditDecisionContinuity();
  assert.equal(audit.prioritySamples, 6);
  assert.deepEqual(audit.priorityOrder, ['fate', 'heroAscension', 'runContract', 'bossReward', 'levelUp', null]);
});

test('phase 1137 audit covers stacked level-ups and repeated boss rewards', async () => {
  const { auditDecisionContinuity } = await loadAudit();
  const audit = auditDecisionContinuity();
  assert.equal(audit.stackedLevelUpSamples, 6);
  assert.equal(audit.repeatedBossRewardSamples, 4);
  assert.equal(audit.pendingPreserved, true);
});

test('phase 1138-1140 audit proves exactly-once barrier lifecycle and frozen surface invariants', async () => {
  const { auditDecisionContinuity } = await loadAudit();
  const audit = auditDecisionContinuity();
  assert.equal(audit.exactlyOncePassed, true);
  assert.equal(audit.transitionBarrierPassed, true);
  assert.equal(audit.lifecycleResetPassed, true);
  assert.equal(audit.autoSelection, false);
  assert.equal(audit.actionCount, 9);
  assert.equal(audit.snapshotSchemaMutation, false);
  assert.equal(audit.economyMutation, false);
  assert.ok(audit.samples >= 20);
});
