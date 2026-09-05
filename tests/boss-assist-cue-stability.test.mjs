import test from 'node:test';
import assert from 'node:assert/strict';
import { bossActionAssist } from '../dist/game/boss-action-assist.js';

test('phase 1343 keeps a still-usable cue stable inside the 0.45s memory window',()=>{
  const first=bossActionAssist({archetype:'summoner',specialTimer:.8,hpRatio:.8,potions:0,readyActions:new Set(['spell2'])});
  assert.equal(first?.actionId,'spell2');
  const next=bossActionAssist({
    archetype:'summoner',specialTimer:.7,hpRatio:.8,potions:0,
    readyActions:new Set(['spell4','spell2']),
    previousCue:first,previousCueAge:.2,previousArchetype:'summoner',
  });
  assert.equal(next?.actionId,'spell2');
});

import fs from 'node:fs';

test('phase 1351 potion rescue overrides a remembered combat cue immediately',()=>{
  const previous={actionId:'spell2',label:'특수기 대응',accent:'#ffe17a'};
  const cue=bossActionAssist({archetype:'summoner',specialTimer:.4,hpRatio:.25,potions:1,readyActions:new Set(['potion','spell2']),previousCue:previous,previousCueAge:.1,previousArchetype:'summoner'});
  assert.equal(cue?.actionId,'potion');
});

test('phase 1352 unavailable or expired memory falls through to the current legal response',()=>{
  const previous={actionId:'spell2',label:'특수기 대응',accent:'#ffe17a'};
  const unavailable=bossActionAssist({archetype:'summoner',specialTimer:.4,hpRatio:.8,potions:0,readyActions:new Set(['spell4']),previousCue:previous,previousCueAge:.1,previousArchetype:'summoner'});
  assert.equal(unavailable?.actionId,'spell4');
  const expired=bossActionAssist({archetype:'summoner',specialTimer:.4,hpRatio:.8,potions:0,readyActions:new Set(['spell4','spell2']),previousCue:previous,previousCueAge:.46,previousArchetype:'summoner'});
  assert.equal(expired?.actionId,'spell4');
});

test('phase 1359 archetype changes and special-window exit cannot reuse stale cue memory',()=>{
  const previous={actionId:'spell2',label:'특수기 대응',accent:'#ffe17a'};
  const changed=bossActionAssist({archetype:'juggernaut',specialTimer:.4,hpRatio:.8,potions:0,readyActions:new Set(['spell3','spell2']),previousCue:previous,previousCueAge:.1,previousArchetype:'summoner'});
  assert.equal(changed?.actionId,'spell3');
  const outside=bossActionAssist({archetype:'summoner',specialTimer:1.06,hpRatio:.8,potions:0,readyActions:new Set(['spell2']),previousCue:previous,previousCueAge:.1,previousArchetype:'summoner'});
  assert.equal(outside,null);
});

test('phase 1367 Game owns boss assist memory separately from opening prep and clears it outside the combat window',()=>{
  const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(source,/bossActionAssistCue/);
  assert.match(source,/bossActionAssistCueSince/);
  assert.match(source,/bossActionAssistBossId/);
  assert.match(source,/bossActionAssist\(\{[^}]*previousCue[^}]*previousCueAge/s);
  assert.match(source,/clearBossActionAssistCue/);
  assert.match(source,/const controlAssist=actionAssist\?\?prepAssist/);
});
