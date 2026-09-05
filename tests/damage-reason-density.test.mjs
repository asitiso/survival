import test from 'node:test';
import assert from 'node:assert/strict';
import { recordDamageReason } from '../dist/game/damage-reason-feedback.js';

test('phase 463 rapid normal hits from different sources keep the first readable cue instead of flickering labels',()=>{
  const first=recordDamageReason(null,'projectile',4,100,10);
  const second=recordDamageReason(first,'contact',3,100,10.08);
  assert.equal(second.source,'projectile');
  assert.equal(second.amount,4);
});

test('phase 464 a materially heavier hit can interrupt the short density guard immediately',()=>{
  const first=recordDamageReason(null,'contact',4,100,10);
  const second=recordDamageReason(first,'explosion',18,100,10.08);
  assert.equal(second.source,'explosion');
  assert.equal(second.severity,'heavy');
});

test('phase 465 repeated hits from the same source still merge during the density guard',()=>{
  let state=recordDamageReason(null,'projectile',4,100,10);
  state=recordDamageReason(state,'projectile',5,100,10.08);
  assert.equal(state.source,'projectile');
  assert.equal(state.amount,9);
});

test('phase 466 damage density control adds no persistent state fields or new long-lived timer schema',()=>{
  const state=recordDamageReason(null,'arena',8,100,2);
  assert.deepEqual(Object.keys(state).sort(),['amount','expiresAt','label','severity','source'].sort());
  assert.ok(state.expiresAt<=3.15);
});
