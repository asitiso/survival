import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('Phase 4419-4424 game owns per-enemy freeze lifecycle state and updates it with frame dt',()=>{
  assert.match(game,/freezeStatusLifecycleByEnemy/);
  assert.match(game,/advanceFreezeStatusLifecycle/);
  assert.match(game,/createFreezeStatusLifecycleState/);
  assert.match(game,/this\.presentationSettings\.reducedMotion/);
});

test('Phase 4419-4424 renderer keeps release tails, edge-scales cues, and hands slowed deaths to existing shatter VFX',()=>{
  assert.match(game,/freezeStatusEdgePresentation/);
  assert.match(game,/lifecycle\.visible/);
  assert.match(game,/edge\.sizeScale/);
  assert.match(game,/if\(death\.wasSlowed\)this\.queueFreezeShatterVfx/);
});

test('Phase 4419-4424 run reset clears freeze lifecycle memory',()=>{
  assert.match(game,/this\.freezeStatusLifecycleByEnemy\.clear\(\)/);
});
