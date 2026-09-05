import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('game derives one last-law-aware safe-zone state for combat and rendering seams',()=>{
  assert.match(game,/lastLawSafeZoneLifecycle/);
  assert.match(game,/private currentMythicSafeZone\(/);
  assert.match(game,/lastLawSafeZoneLifecycle\(lastLaw\.active, destroyedRatio\)/);
  assert.match(game,/mythicSafeZoneState\([^\n]+lifecycle\)/);
  const uses=game.match(/this\.currentMythicSafeZone\(boss,\s*destroyedRatio\)/g)??[];
  assert.ok(uses.length>=3,`expected >=3 shared safe-zone uses, got ${uses.length}`);
});
