import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const projectionSource=fs.readFileSync(new URL('../src/game/endless/boss-effective-pressure-projection.ts',import.meta.url),'utf8');
const gameSource=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('phase 2362 threat retention stays presentation-only with the existing two-chip HUD contract',()=>{
  assert.match(projectionSource,/impact==='threat'/);
  assert.match(gameSource,/projection\.primaryEffects\.slice\(0,2\)/);
  assert.match(gameSource,/const effects=projection\.primaryEffects\.slice\(0,2\)/);
  assert.doesNotMatch(gameSource,/boss-pressure-threat.*\.png/i);
});

test('phase 2363 existing semantic text and attention suppression remain intact',()=>{
  assert.match(gameSource,/effect\.impactLabel/);
  assert.match(gameSource,/hideBossEffectivePressureRecall\(boss\)/);
  assert.match(gameSource,/bossEffectivePressureLastLawActive\(boss\)/);
});
