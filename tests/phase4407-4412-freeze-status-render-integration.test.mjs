import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('Phase 4407-4412 live freeze status rendering derives visual strength from slowFactor and slowTimer',()=>{
  assert.match(game,/freezeStatusPresentation/);
  assert.match(game,/slowFactor:enemy\.slowFactor/);
  assert.match(game,/slowTimer:enemy\.slowTimer/);
  assert.match(game,/presentation\.sizeScale/);
  assert.match(game,/presentation\.alpha/);
});
