import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const enemies=fs.readFileSync(new URL('../src/game/enemies.ts',import.meta.url),'utf8');

test('game creates a one-shot tactic attack link when tactic break succeeds',()=>{
  assert.match(game,/createMythicTacticAttackLink\(/);
  assert.match(game,/mythicTacticAttackLink/);
});

test('enemy manager consumes tactic attack link at boss special execution seam',()=>{
  assert.match(enemies,/mythicTacticAttackLink\?/);
  assert.match(enemies,/onMythicTacticAttackLinkConsumed/);
  assert.match(enemies,/projectileCountMultiplier/);
});
