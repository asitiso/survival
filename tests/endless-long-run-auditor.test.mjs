import test from 'node:test';
import assert from 'node:assert/strict';

import { auditEightHourRun } from '../dist/game/endless/long-run-auditor.js';

for (const deviceClass of ['low','mid','high']) {
  test(`phase 60 ${deviceClass} device stays within 240 to 480 minute hard caps`, () => {
    const audit=auditEightHourRun(deviceClass,5);
    assert.deepEqual(audit.checkpoints.map((x)=>x.minute),[240,300,360,480]);
    assert.equal(audit.checkpoints.at(-1).ascensionTier,10);
    assert.ok(audit.checkpoints.every((x)=>x.withinGuard));
    assert.equal(audit.passed,true);
  });
}

test('phase 61 long-run pressure reduces presentation before enemy logic capacity', () => {
  const audit=auditEightHourRun('low',5);
  for (const point of audit.checkpoints) {
    assert.equal(point.enemyLogicCap,220);
    assert.ok(point.effectCap < 60);
    assert.ok(point.projectileCap > point.effectCap);
    assert.equal(point.visualQuality,'minimal');
  }
  assert.equal(audit.presentationFirst,true);
});

test('phase 62 eight-hour demand is clamped rather than growing arrays without bound', () => {
  const audit=auditEightHourRun('low',5);
  const last=audit.checkpoints.at(-1);
  assert.ok(last.enemyDemand > last.enemyLogicCap);
  assert.equal(last.simulatedEnemies,last.enemyLogicCap);
  assert.equal(last.simulatedProjectiles,last.projectileCap);
  assert.equal(last.simulatedEffects,last.effectCap);
  assert.ok(audit.estimatedTransientEntities <= 400);
});
