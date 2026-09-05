import test from 'node:test';
import assert from 'node:assert/strict';
import { bossActionAssist } from '../dist/game/boss-action-assist.js';

test('phase 1423 same-cycle response latch suppresses ordinary assist beyond timed acknowledgement',()=>{
  const cue=bossActionAssist({
    archetype:'summoner',specialTimer:.2,hpRatio:.8,potions:0,
    readyActions:new Set(['spell4','ultimate1']),
    acknowledged:false,cycleAcknowledged:true,
  });
  assert.equal(cue,null);
});

test('phase 1439 potion rescue overrides same-cycle response latch',()=>{
  const cue=bossActionAssist({
    archetype:'summoner',specialTimer:.2,hpRatio:.25,potions:1,
    readyActions:new Set(['potion','spell4']),
    acknowledged:false,cycleAcknowledged:true,
  });
  assert.equal(cue?.actionId,'potion');
});

test('phase 1431 next cycle reprompts when the cycle latch no longer matches',()=>{
  const cue=bossActionAssist({
    archetype:'summoner',specialTimer:.9,hpRatio:.8,potions:0,
    readyActions:new Set(['spell4']),
    acknowledged:false,cycleAcknowledged:false,
  });
  assert.equal(cue?.actionId,'spell4');
});
