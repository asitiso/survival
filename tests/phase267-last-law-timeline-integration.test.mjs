import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
test('boss arena HUD merges SAFE timeline with Last Law identity without automove',()=>{
  assert.match(game,/lastLawSafeTimeline\(/);
  assert.match(game,/lawTimeline/);
  assert.match(game,/lawTimeline\.accent/);
});
