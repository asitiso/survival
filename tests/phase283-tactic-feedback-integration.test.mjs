import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const enemies=fs.readFileSync(new URL('../src/game/enemies.ts',import.meta.url),'utf8');

test('enemy manager reports which mythic archetype consumed the one-shot tactic link',()=>{
  assert.match(enemies,/onMythicTacticAttackLinkConsumed\?:\s*\(\(archetype:\s*BossArchetype\)\s*=>\s*void\)/);
  assert.match(enemies,/onMythicTacticAttackLinkConsumed\?\.\(archetype\)/);
});

test('game renders tactic-link success feedback only from the consume callback seam',()=>{
  assert.match(game,/mythicTacticLinkFeedback/);
  assert.match(game,/onMythicTacticAttackLinkConsumed:\s*\(archetype\)\s*=>\s*\{/);
  assert.match(game,/emitMythicTacticLinkFeedback\(archetype\)/);
  assert.match(game,/private emitMythicTacticLinkFeedback\(/);
  assert.match(game,/this\.audio\.play\(feedback\.soundKind\)/);
});
