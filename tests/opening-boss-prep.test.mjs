import test from 'node:test';
import assert from 'node:assert/strict';
import { openingBossPrepAssist } from '../dist/game/opening-boss-prep.js';

test('phase 555 first-boss countdown points to an unused shop token before inventing another cue',()=>{
  const cue=openingBossPrepAssist({elapsedSeconds:112,bossCountdown:8,shopTokens:1,hpRatio:1,potions:1});
  assert.equal(cue?.actionId,'shop');
  assert.equal(cue?.label,'준비');
});

test('phase 556 without a shop token low HP points to the existing potion action',()=>{
  const cue=openingBossPrepAssist({elapsedSeconds:112,bossCountdown:8,shopTokens:0,hpRatio:.55,potions:1});
  assert.equal(cue?.actionId,'potion');
});

test('phase 557 healthy prepared runs stay silent instead of adding decorative boss advice',()=>{
  assert.equal(openingBossPrepAssist({elapsedSeconds:112,bossCountdown:8,shopTokens:0,hpRatio:.9,potions:1}),null);
});

test('phase 558 opening boss prep is bounded to the first boss window and existing actions only',()=>{
  assert.equal(openingBossPrepAssist({elapsedSeconds:400,bossCountdown:8,shopTokens:2,hpRatio:.5,potions:2}),null);
  assert.equal(openingBossPrepAssist({elapsedSeconds:112,bossCountdown:15,shopTokens:1,hpRatio:.5,potions:2}),null);
});
