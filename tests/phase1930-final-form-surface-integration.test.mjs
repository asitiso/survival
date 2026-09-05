import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const results=fs.readFileSync(new URL('../src/ui/results.ts',import.meta.url),'utf8');
const lobby=fs.readFileSync(new URL('../src/ui/lobby.ts',import.meta.url),'utf8');
const replay=fs.readFileSync(new URL('../src/domain/build-replay-guidance.ts',import.meta.url),'utf8');
test('Phase 1930 final form identity reaches six approved surfaces',()=>{
  assert.match(game,/initializeFinalFormIdentityAtlas\(\)/);
  assert.match(game,/drawFinalFormIdentityHud\(/);
  assert.match(game,/showFinalFormTransformationCue\(/);
  assert.match(results,/finalFormIdentityIconStyle/);
  assert.match(lobby,/finalFormIdentityIconStyle/);
  assert.match(replay,/finalFormIdentityIconStyle/);
});
