import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('phase 2385-2387 primed tactic identity reuses the existing boss icon and adds max-two projected effect labels',()=>{
  assert.match(game,/projectMythicTacticAttackLink/);
  assert.match(game,/drawMythicTacticPrimedIcon\(ctx:CanvasRenderingContext2D\)/);
  assert.match(game,/projection\.primaryEffects\.slice\(0,2\)/);
  assert.match(game,/effect\.label/);
  assert.match(game,/mythicTacticIdentityIcon\(mythicTacticIdentityIdForArchetype\(link\.archetype\)\)/);
});

test('phase 2385-2387 tactic-link effect recall adds no new global HUD row input audio or haptic path',()=>{
  const method=game.match(/private drawMythicTacticPrimedIcon\([\s\S]*?\n  }\n\n  private drawAscensionMutatorToastIcon/)?.[0]??'';
  assert.ok(method.length>0);
  assert.doesNotMatch(method,/showEventToast|playSound|haptic|pointer|keydown|ACTION_BUTTONS/);
  assert.match(method,/boss\.pos/);
});
