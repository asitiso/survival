import test from 'node:test';
import assert from 'node:assert/strict';
import { ComboRuntime } from '../dist/game/combo-runtime.js';

const combo = (tier,name='잿불 연쇄') => ({family:tier?'inferno-chain':'none',name:tier?name:'',tier,label:tier===1?'LINK':tier===2?'SURGE':tier===3?'ASCENDANCY':'',powerMultiplier:1+tier*0.04,cooldownMultiplier:1-tier*0.02,areaMultiplier:1+tier*0.04});

test('combo runtime tracks current build while preserving the highest tier reached', () => {
  const runtime=new ComboRuntime();
  runtime.update(combo(3));
  runtime.update(combo(1));
  assert.equal(runtime.current.tier,1);
  assert.equal(runtime.highest.tier,3);
  assert.equal(runtime.highest.name,'잿불 연쇄');
});

test('combo combat modifiers stay bounded and reset returns neutral', () => {
  const runtime=new ComboRuntime();
  runtime.update({...combo(3),powerMultiplier:9,cooldownMultiplier:0.1,areaMultiplier:9});
  assert.ok(runtime.modifiers.spellPowerMultiplier<=1.12);
  assert.ok(runtime.modifiers.cooldownMultiplier>=0.94);
  assert.ok(runtime.modifiers.areaMultiplier<=1.12);
  runtime.reset();
  assert.deepEqual(runtime.modifiers,{spellPowerMultiplier:1,cooldownMultiplier:1,areaMultiplier:1});
  assert.equal(runtime.highest.tier,0);
});
