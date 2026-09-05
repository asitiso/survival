import test from 'node:test';
import assert from 'node:assert/strict';
import { FateRuntime } from '../dist/game/fate-runtime.js';

test('fate runtime opens one pending choice at each checkpoint and never duplicates it', () => {
  const runtime = new FateRuntime();
  assert.equal(runtime.update(359), false);
  assert.equal(runtime.update(360), true);
  assert.equal(runtime.pending, true);
  assert.equal(runtime.update(500), false);
  assert.equal(runtime.choose('frenzy'), true);
  assert.equal(runtime.pending, false);
  assert.deepEqual(runtime.choices, ['frenzy']);
  assert.equal(runtime.update(719), false);
  assert.equal(runtime.update(720), true);
});

test('fate runtime accepts at most three choices and exposes composed modifiers', () => {
  const runtime = new FateRuntime();
  for (const [time, choice] of [[360, 'frenzy'], [720, 'golden'], [1080, 'guardian']]) {
    runtime.update(time);
    assert.equal(runtime.choose(choice), true);
  }
  assert.equal(runtime.update(2000), false);
  assert.equal(runtime.choose('frenzy'), false);
  assert.equal(runtime.choices.length, 3);
  assert.ok(runtime.modifiers.goldMultiplier > 1);
  assert.ok(runtime.modifiers.coreDamageTakenMultiplier < 1);
});

test('reset clears pending choice and accumulated path state', () => {
  const runtime = new FateRuntime();
  runtime.update(360);
  runtime.choose('golden');
  runtime.reset();
  assert.equal(runtime.pending, false);
  assert.deepEqual(runtime.choices, []);
  assert.equal(runtime.modifiers.goldMultiplier, 1);
});
