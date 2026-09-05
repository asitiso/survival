import test from 'node:test';
import assert from 'node:assert/strict';
import { bossActionAssist } from '../dist/game/boss-action-assist.js';

test('phase 1383 acknowledged manual boss response suppresses ordinary assist cue',()=>{
  const cue=bossActionAssist({
    archetype:'summoner',specialTimer:.55,hpRatio:.8,potions:0,
    readyActions:new Set(['spell4','ultimate1']),acknowledged:true,
  });
  assert.equal(cue,null);
});

test('phase 1407 potion rescue overrides acknowledgement immediately',()=>{
  const cue=bossActionAssist({
    archetype:'summoner',specialTimer:.55,hpRatio:.25,potions:1,
    readyActions:new Set(['potion','spell4']),acknowledged:true,
  });
  assert.equal(cue?.actionId,'potion');
});

test('phase 1399 queued previous response keeps its cue while waiting for buffered cast',()=>{
  const previous={actionId:'spell2',label:'특수기 대응',accent:'#ffe17a'};
  const cue=bossActionAssist({
    archetype:'summoner',specialTimer:.5,hpRatio:.8,potions:0,
    readyActions:new Set(['spell4']),queuedActions:new Set(['spell2']),
    previousCue:previous,previousCueAge:.2,previousArchetype:'summoner',
  });
  assert.equal(cue?.actionId,'spell2');
});
