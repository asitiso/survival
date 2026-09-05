import test from 'node:test'; import assert from 'node:assert/strict'; import fs from 'node:fs';
const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
test('phase 2128-2132 wires Mythic Phase encounter, persistent recall, transition toast and weakpoint pressure cue',()=>{
  assert.match(game,/initializeMythicPhaseIdentityAtlas\(\)/);
  assert.match(game,/drawMythicPhaseRecall\(ctx,boss\)/);
  assert.match(game,/showMythicPhaseEventToast\(/);
  assert.match(game,/MYTHIC PHASE II · 압박 격화/);
  assert.match(game,/MYTHIC PHASE III · 최종 폭주/);
  assert.match(game,/mythicPhasePressureSegments\(/);
  assert.match(game,/mythicPhaseProfile\(mythic,boss\.hp \/ Math\.max\(1,boss\.maxHp\),weakpointRatio\)/);
});
test('phase 2128-2132 keeps general boss phase cue separate and only recalls Mythic phase for Mythic bosses',()=>{
  assert.match(game,/if\(!boss\.isMythic\)return/);
  assert.match(game,/bossPhaseForRatio\(hpRatio\)/);
  assert.match(game,/eventToastMythicPhase/);
});
