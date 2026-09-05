import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../src/game/enemies.ts',import.meta.url),'utf8');
test('twin maw tactic link reduces both mirrored projectile fans',()=>{
  const twinBlock=source.slice(source.indexOf("} else if (archetype === 'twinMaw')"),source.indexOf("} else {",source.indexOf("} else if (archetype === 'twinMaw')")));
  const uses=(twinBlock.match(/projectileCount\(tuning\.fanProjectiles\)/g)??[]).length;
  assert.equal(uses,2);
});
