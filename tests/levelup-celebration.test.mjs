import test from 'node:test';
import assert from 'node:assert/strict';
import * as levelup from '../dist/ui/levelup.js';

test('level-up celebration has a visible burst without overwhelming the screen', () => {
  assert.equal(typeof levelup.levelUpCelebrationPlan, 'function');
  const plan = levelup.levelUpCelebrationPlan(false);
  assert.ok(plan.sparkCount >= 20 && plan.sparkCount <= 28);
  assert.equal(plan.ringCount, 2);
  assert.equal(plan.flash, true);
  assert.ok(plan.durationMs >= 620 && plan.durationMs <= 850);
});

test('reduced motion keeps the level-up celebration calm', () => {
  assert.equal(typeof levelup.levelUpCelebrationPlan, 'function');
  const plan = levelup.levelUpCelebrationPlan(true);
  assert.equal(plan.sparkCount, 0);
  assert.equal(plan.ringCount, 0);
  assert.equal(plan.flash, false);
});
