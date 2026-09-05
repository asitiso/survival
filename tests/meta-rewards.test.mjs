import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateArcaneShards, loadArcaneShards, saveArcaneShards } from '../dist/domain/meta-rewards.js';

function fakeStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, String(value)); },
    snapshot() { return Object.fromEntries(data); },
  };
}

test('arcane shard reward grows from survival bosses danger and kill milestones', () => {
  const short = calculateArcaneShards({ seconds: 120, bosses: 0, danger: 2, kills: 300 });
  const deep = calculateArcaneShards({ seconds: 1500, bosses: 5, danger: 12, kills: 7000 });
  assert.ok(short >= 1);
  assert.ok(deep > short * 5);
});

test('arcane shard reward stays finite for extreme endless runs', () => {
  const reward = calculateArcaneShards({ seconds: 1000000, bosses: 999, danger: 999, kills: 9999999 });
  assert.ok(Number.isFinite(reward));
  assert.ok(reward > 0);
});

test('arcane shard storage falls back safely when stored data is missing or malformed', () => {
  assert.equal(loadArcaneShards(fakeStorage()), 0);
  assert.equal(loadArcaneShards(fakeStorage({ 'arcane-last-stand.shards': 'broken' })), 0);
  assert.equal(loadArcaneShards(fakeStorage({ 'arcane-last-stand.shards': '-55' })), 0);
});

test('arcane shard save and load persist a nonnegative integer total', () => {
  const storage = fakeStorage();
  saveArcaneShards(storage, 137.9);
  assert.equal(loadArcaneShards(storage), 137);
  assert.equal(storage.snapshot()['arcane-last-stand.shards'], '137');
});
