import test from 'node:test';
import assert from 'node:assert/strict';
import { combatCuePriorityPolicy } from '../dist/game/combat-cue-priority.js';

test('phase 507 normal combat keeps the full projectile cue budget and secondary labels',()=>{
  const p=combatCuePriorityPolicy({damageSeverity:null,bossSpecialTimer:9});
  assert.equal(p.maxProjectileCues,6); assert.equal(p.showAutoLabel,true); assert.equal(p.showWeakpointLabel,true);
});
test('phase 508 imminent boss special outranks AUTO text and reduces projectile clutter',()=>{
  const p=combatCuePriorityPolicy({damageSeverity:null,bossSpecialTimer:.6});
  assert.ok(p.maxProjectileCues<=3); assert.equal(p.showAutoLabel,false); assert.equal(p.primary,'boss-response');
});
test('phase 509 critical damage gets top priority while preserving threat rings',()=>{
  const p=combatCuePriorityPolicy({damageSeverity:'critical',bossSpecialTimer:.4});
  assert.equal(p.primary,'damage-critical'); assert.ok(p.maxProjectileCues<=2); assert.equal(p.showWeakpointLabel,false);
});
test('phase 510 heavy damage reduces text density without hiding all projectile warnings',()=>{
  const p=combatCuePriorityPolicy({damageSeverity:'heavy',bossSpecialTimer:9});
  assert.ok(p.maxProjectileCues>=3&&p.maxProjectileCues<6); assert.equal(p.showAutoLabel,true);
});
