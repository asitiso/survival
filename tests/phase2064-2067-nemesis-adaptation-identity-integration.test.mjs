import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getBossAdaptations } from '../dist/game/endless/nemesis.js';
const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('phase 2064-2067 Game connects nemesis learning toast and boss encounter recall without a new HUD row',()=>{
  assert.match(source,/NEMESIS_ADAPTATION_IDENTITY_ATLAS/);
  assert.match(source,/initializeNemesisAdaptationIdentityAtlas/);
  assert.match(source,/eventToastNemesisAdaptations/);
  assert.match(source,/drawNemesisAdaptationToastIcons\(ctx/);
  assert.match(source,/drawNemesisAdaptationRecall\(ctx/);
  assert.match(source,/getBossAdaptations\(this\.endlessState\.nemesis/);
  assert.match(source,/Math\.min\(3/);
  assert.match(source,/adaptation\.rank/);
  assert.match(source,/adaptation\.affinity/);
});

test('phase 2064-2067 nemesis rank max-three ORDER tie-break and mirror affinity contract remain unchanged',()=>{
  const state={profiles:{inferno:{bossId:'inferno',encounters:3,marks:{spell_guard:5,blink_hunt:5,core_siege:5,enrage_clock:5,mirror_affinity:5},affinityTotals:{fire:120,frost:240},mirrorAffinity:'frost',longestEncounterMs:90000,totalCoreDamage:500,defeats:2}}};
  const adaptations=getBossAdaptations(state,'inferno');
  assert.deepEqual(adaptations,[{kind:'core_siege',rank:3},{kind:'enrage_clock',rank:3},{kind:'blink_hunt',rank:3}]);
  state.profiles.inferno.marks={spell_guard:1,blink_hunt:0,core_siege:0,enrage_clock:0,mirror_affinity:4};
  assert.deepEqual(getBossAdaptations(state,'inferno'),[{kind:'mirror_affinity',rank:2,affinity:'frost'},{kind:'spell_guard',rank:1}]);
});
