import test from 'node:test';
import assert from 'node:assert/strict';
import { ObjectiveRuntime, objectiveRewardFor } from '../dist/game/objective-runtime.js';

test('cursed altar activates by contact and completes with gold plus temporary power', () => {
  const runtime = new ObjectiveRuntime();
  runtime.begin('cursedAltar', { x: 500, y: 500 });
  runtime.activateAltar();
  const transition = runtime.update(22, { hero: { x: 500, y: 500 }, nearbyEnemies: 4 });
  assert.equal(transition.completed, true);
  assert.equal(runtime.stats.completed, 1);
  assert.equal(runtime.stats.bestStreak, 1);
  assert.deepEqual(transition.rewards, [
    { kind: 'gold', amount: 180 },
    { kind: 'temporaryPower', amount: 20 },
  ]);
});

test('rift objective completes by staying inside and can reward a shop token on streak', () => {
  const runtime = new ObjectiveRuntime();
  runtime.begin('riftSeal', { x: 400, y: 400 });
  let done = null;
  for (let i = 0; i < 7 && !done?.completed; i++) done = runtime.update(1, { hero: { x: 400, y: 400 }, nearbyEnemies: 0 });
  assert.equal(done.completed, true);
  assert.equal(runtime.stats.currentStreak, 1);
  runtime.begin('riftSeal', { x: 400, y: 400 });
  done = null;
  for (let i = 0; i < 7 && !done?.completed; i++) done = runtime.update(1, { hero: { x: 400, y: 400 }, nearbyEnemies: 0 });
  assert.ok(done.rewards.some((reward) => reward.kind === 'shopToken'));
});

test('beacon failure resets objective streak without a resource penalty', () => {
  const runtime = new ObjectiveRuntime();
  runtime.stats.currentStreak = 3;
  runtime.stats.bestStreak = 3;
  runtime.begin('beaconDefense', { x: 500, y: 500 });
  const failed = runtime.update(4, { hero: { x: 900, y: 900 }, nearbyEnemies: 20 });
  assert.equal(failed.failed, true);
  assert.equal(failed.rewards.length, 0);
  assert.equal(runtime.stats.failed, 1);
  assert.equal(runtime.stats.currentStreak, 0);
  assert.equal(runtime.stats.bestStreak, 3);
});

test('objective rewards use existing bounded resource types only', () => {
  for (const id of ['riftSeal','beaconDefense','cursedAltar']) {
    for (let streak = 1; streak <= 8; streak++) {
      const rewards = objectiveRewardFor(id, streak);
      for (const reward of rewards) {
        assert.ok(['gold','shopToken','potion','temporaryPower'].includes(reward.kind));
        assert.ok(reward.amount > 0 && reward.amount <= 400);
      }
    }
  }
});

test('runtime reset clears active objective and run stats', () => {
  const runtime = new ObjectiveRuntime();
  runtime.stats.completed = 4;
  runtime.stats.failed = 2;
  runtime.stats.bestStreak = 3;
  runtime.begin('riftSeal', { x: 300, y: 300 });
  runtime.reset();
  assert.equal(runtime.active, null);
  assert.deepEqual(runtime.stats, { completed: 0, failed: 0, currentStreak: 0, bestStreak: 0 });
});
