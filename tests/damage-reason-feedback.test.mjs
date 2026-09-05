import test from 'node:test';
import assert from 'node:assert/strict';
import { damageReasonCue, recordDamageReason, advanceDamageReason } from '../dist/game/damage-reason-feedback.js';

test('phase 443 damage feedback names contact projectile explosion and arena sources in short player-readable copy',()=>{
  assert.match(damageReasonCue('contact',12,100).label,/근접/);
  assert.match(damageReasonCue('projectile',12,100).label,/투사체/);
  assert.match(damageReasonCue('explosion',12,100).label,/폭발/);
  assert.match(damageReasonCue('arena',12,100).label,/위험지대/);
});

test('phase 444 damage feedback escalates only meaningful heavy hits instead of turning every chip hit into an alert',()=>{
  assert.equal(damageReasonCue('contact',4,100).severity,'normal');
  assert.equal(damageReasonCue('projectile',16,100).severity,'heavy');
  assert.equal(damageReasonCue('explosion',35,100).severity,'critical');
});

test('phase 445 repeated hits merge into one bounded cue with accumulated damage rather than stacking toast spam',()=>{
  let state=recordDamageReason(null,'projectile',8,100,5);
  state=recordDamageReason(state,'projectile',7,100,5.15);
  assert.equal(state.source,'projectile');
  assert.equal(state.amount,15);
  assert.ok(state.expiresAt<=6.25);
});

test('phase 446 damage feedback expires cleanly and never creates persistent snapshot state',()=>{
  const state=recordDamageReason(null,'arena',10,100,3);
  assert.equal(advanceDamageReason(state,3.5)?.source,'arena');
  assert.equal(advanceDamageReason(state,5),null);
  assert.deepEqual(Object.keys(state).sort(),['amount','expiresAt','label','severity','source'].sort());
});
