import test from 'node:test';
import assert from 'node:assert/strict';
import { kainOverloadNext, kainOverloadCooldownMultiplier } from '../dist/game/hero-passives.js';

test('kain overload charges while moving and drains while stationary', () => {
  const charged = kainOverloadNext(0.2, true, 1);
  const drained = kainOverloadNext(charged, false, 1);
  assert.ok(charged > 0.2);
  assert.ok(drained < charged);
  assert.ok(charged <= 1);
  assert.ok(drained >= 0);
});

test('full overload materially accelerates spell spam without removing cooldowns', () => {
  const empty = kainOverloadCooldownMultiplier(0);
  const full = kainOverloadCooldownMultiplier(1);
  assert.equal(empty, 1);
  assert.ok(full <= 0.82);
  assert.ok(full >= 0.72);
});

test('storm core makes kain overload charge faster and rewards full movement more strongly', () => {
  const normalCharge = kainOverloadNext(0, true, 1, 1);
  const relicCharge = kainOverloadNext(0, true, 1, 1.55);
  assert.ok(relicCharge > normalCharge * 1.45);
  assert.equal(kainOverloadCooldownMultiplier(1, 0.20), 0.8);
  assert.equal(kainOverloadCooldownMultiplier(1, 0.30), 0.7);
});
