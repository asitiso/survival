import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const projectionUrl=new URL('../dist/game/endless/boss-effective-pressure-projection.js',import.meta.url);

test('phase 2378 exposes a compact hidden-threat hint without adding another pressure row',async()=>{
  const {projectBossEffectivePressure,bossEffectivePressureHiddenThreatHint}=await import(projectionUrl.href);
  const p=projectBossEffectivePressure({bossDamageTakenMultiplier:1.25,specialCadenceMultiplier:.95,summonCountMultiplier:1.20,dashDistanceMultiplier:1.15});
  assert.equal(bossEffectivePressureHiddenThreatHint(p),'+1 위험');
  assert.equal(p.maxPrimaryEffects,2);
});

test('phase 2379 draws hidden-threat count on the existing boss-pressure line and adds no image asset',()=>{
  const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(game,/hiddenThreatLabel/);
  assert.match(game,/drawBossEffectivePressureRecall/);
  assert.doesNotMatch(game,/boss-hidden-threat[^\n]*Atlas/i);
});
