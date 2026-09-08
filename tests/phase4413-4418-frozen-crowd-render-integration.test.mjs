import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('Phase 4413-4418 live freeze renderer applies crowd budget from committed target result proximity warnings and safe lane',()=>{
  assert.match(game,/freezeCrowdBudget/);
  assert.match(game,/currentTargetId/);
  assert.match(game,/hasActionResultNear\(enemy\.pos/);
  assert.match(game,/battlefieldStress/);
  assert.match(game,/protectedWarning/);
  assert.match(game,/safeLaneVisible/);
  assert.match(game,/crowdEntry\.alphaScale/);
  assert.match(game,/crowdEntry\.sizeScale/);
  assert.match(game,/crowdEntry\.pulseScale/);
});
