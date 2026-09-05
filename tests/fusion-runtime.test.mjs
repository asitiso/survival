import test from 'node:test';
import assert from 'node:assert/strict';
import { FusionRuntime } from '../dist/game/fusion-runtime.js';

test('fusion runtime equips at most two unique fusions', () => {
  const runtime = new FusionRuntime();
  assert.equal(runtime.equip('solar-detonation'), true);
  assert.equal(runtime.equip('solar-detonation'), false);
  assert.equal(runtime.equip('storm-crucible'), true);
  assert.equal(runtime.equip('frostfire-cataclysm'), false);
  assert.deepEqual(runtime.equipped, ['solar-detonation', 'storm-crucible']);
});

test('fusion trigger cadence is bounded and recovers with update', () => {
  const runtime = new FusionRuntime();
  runtime.equip('solar-detonation');
  assert.equal(runtime.tryTrigger('solar-detonation'), true);
  assert.equal(runtime.tryTrigger('solar-detonation'), false);
  runtime.update(0.4);
  assert.equal(runtime.tryTrigger('solar-detonation'), false);
  runtime.update(0.8);
  assert.equal(runtime.tryTrigger('solar-detonation'), true);
});

test('reset clears equipped fusions and trigger cooldowns', () => {
  const runtime = new FusionRuntime();
  runtime.equip('glacial-conduit');
  runtime.tryTrigger('glacial-conduit');
  runtime.reset();
  assert.deepEqual(runtime.equipped, []);
  assert.equal(runtime.tryTrigger('glacial-conduit'), false);
});
