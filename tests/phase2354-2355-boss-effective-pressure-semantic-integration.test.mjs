import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('phase 2354 unified boss pressure chips render explicit semantic text instead of relying on color or sign alone',()=>{
  assert.match(source,/effect\.impactLabel/);
  assert.match(source,/위험/);assert.match(source,/기회/);
  assert.match(source,/effect\.label/,'existing numeric label remains visible');
});

test('phase 2354 semantic pressure UI reuses the existing pressure atlas and adds no new semantic image atlas',()=>{
  assert.match(source,/mythicSafeZonePressureEffectIdentityIcon\(effect\.effectId\)/);
  assert.doesNotMatch(source,/boss-pressure-semantic.*\.png/i);
});

test('phase 2355 semantic badges inherit the existing final-pressure attention suppression and max-two limit',()=>{
  assert.match(source,/if\(this\.hideBossEffectivePressureRecall\(boss\)\)return/);
  assert.match(source,/projection\.primaryEffects\.slice\(0,2\)/);
  assert.match(source,/heroCritical\|\|coreCritical\|\|\(boss\.specialTimer\?\?99\)<=1\.2/);
});
