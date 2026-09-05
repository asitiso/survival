import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
test('game layers twelve-form presentation signature over existing evade finisher',()=>{
  assert.match(game,/finalFormFinisherSignature\(/);
  assert.match(game,/secondaryAccent/);
  assert.match(game,/labelSuffix/);
});
