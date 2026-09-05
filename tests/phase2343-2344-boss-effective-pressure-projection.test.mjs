import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const projectionUrl=new URL('../dist/game/endless/boss-effective-pressure-projection.js',import.meta.url);

const sample={bossDamageTakenMultiplier:1.18,specialCadenceMultiplier:.68,summonCountMultiplier:.88,dashDistanceMultiplier:.9};

test('phase 2343 projects the actually applied final boss encounter modifiers into four readable effects',async()=>{
  assert.equal(fs.existsSync(projectionUrl),true,'final boss pressure projection module must exist');
  const m=await import(projectionUrl.href);const p=m.projectBossEffectivePressure(sample);
  assert.equal(p.effects.length,4);assert.equal(p.maxPrimaryEffects,2);
  const cadence=p.effects.find(v=>v.effectId==='special-cadence');const boss=p.effects.find(v=>v.effectId==='boss-vulnerability');
  assert.equal(cadence.after,.68);assert.equal(cadence.deltaPercent,-32);assert.equal(cadence.label,'특수주기 -32%');
  assert.equal(boss.after,1.18);assert.equal(boss.deltaPercent,18);assert.equal(boss.label,'보스피해 +18%');
});

test('phase 2344 keeps only the two largest final effects with deterministic order and compact hint',async()=>{
  const m=await import(projectionUrl.href);const p=m.projectBossEffectivePressure(sample);
  assert.deepEqual(p.primaryEffects.map(v=>v.effectId),['special-cadence','boss-vulnerability']);
  assert.equal(m.bossEffectivePressureHint(p,2),'특수주기 -32% · 보스피해 +18%');
});

test('phase 2344 neutral final modifiers produce no redundant helper chips',async()=>{
  const m=await import(projectionUrl.href);const p=m.projectBossEffectivePressure({bossDamageTakenMultiplier:1,specialCadenceMultiplier:1,summonCountMultiplier:1,dashDistanceMultiplier:1});
  assert.equal(p.effects.length,4);assert.deepEqual(p.primaryEffects,[]);assert.equal(m.bossEffectivePressureHint(p,2),'');
});
