import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const projectionUrl=new URL('../dist/game/endless/boss-effective-pressure-projection.js',import.meta.url);

test('phase 2370 multi-threat priority keeps the existing max-two semantic HUD contract',async()=>{
  const {projectBossEffectivePressure,bossEffectivePressureSemanticHint}=await import(projectionUrl.href);
  const p=projectBossEffectivePressure({bossDamageTakenMultiplier:.80,specialCadenceMultiplier:.95,summonCountMultiplier:1.15,dashDistanceMultiplier:.60});
  assert.equal(p.maxPrimaryEffects,2);assert.equal(p.primaryEffects.length,2);assert.ok(p.primaryEffects.every(v=>v.impactLabel==='위험'));
  assert.match(bossEffectivePressureSemanticHint(p),/위험/);
});

test('phase 2371 reuses existing pressure atlas and does not add presentation rows or combat inputs',()=>{
  const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  const projection=fs.readFileSync(new URL('../src/game/endless/boss-effective-pressure-projection.ts',import.meta.url),'utf8');
  assert.match(game,/bossEffectivePressure/);assert.match(projection,/maxPrimaryEffects:\s*2/);
  assert.equal(fs.existsSync(new URL('../assets/ui/mythic-safe-zone-pressure-effect-icons.png',import.meta.url)),true);
});
