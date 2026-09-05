import test from 'node:test';
import assert from 'node:assert/strict';
import { bossActionAssist } from '../dist/game/boss-action-assist.js';
const ready=new Set(['spell1','spell2','spell3','spell4','ultimate1','ultimate2','potion']);
test('phase 491 boss action assist stays silent until the special is genuinely imminent',()=>{
  assert.equal(bossActionAssist({archetype:'inferno',specialTimer:1.6,hpRatio:.8,potions:2,readyActions:ready}),null);
  assert.ok(bossActionAssist({archetype:'inferno',specialTimer:.7,hpRatio:.8,potions:2,readyActions:ready}));
});
test('phase 492 critical hero health makes potion the one highlighted response before a boss special',()=>{
  const cue=bossActionAssist({archetype:'juggernaut',specialTimer:.5,hpRatio:.25,potions:1,readyActions:ready});
  assert.equal(cue?.actionId,'potion');assert.match(cue?.label??'',/회복/);
});
test('phase 493 archetype response falls back to the next ready existing action instead of highlighting cooldown buttons',()=>{
  const cue=bossActionAssist({archetype:'summoner',specialTimer:.6,hpRatio:.9,potions:2,readyActions:new Set(['spell1','ultimate1'])});
  assert.equal(cue?.actionId,'ultimate1');
});
test('phase 494 assist returns at most one combat response and never shop or AUTO',()=>{
  for(const archetype of ['inferno','summoner','juggernaut','abyssWitch','twinMaw','timeEater']){
    const cue=bossActionAssist({archetype,specialTimer:.4,hpRatio:.9,potions:2,readyActions:ready});
    assert.ok(cue);assert.notEqual(cue.actionId,'shop');assert.notEqual(cue.actionId,'auto');
  }
});
