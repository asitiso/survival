import test from 'node:test';
import assert from 'node:assert/strict';
const projectionUrl=new URL('../dist/game/endless/boss-effective-pressure-projection.js',import.meta.url);

test('phase 2367 reserves both visible slots for threats when two threats are present',async()=>{
  const {projectBossEffectivePressure}=await import(projectionUrl.href);
  const p=projectBossEffectivePressure({
    bossDamageTakenMultiplier:1.60,
    specialCadenceMultiplier:.96,
    summonCountMultiplier:1.12,
    dashDistanceMultiplier:.70,
  });
  assert.deepEqual(p.primaryEffects.map(v=>v.effectId),['summon-pressure','special-cadence']);
  assert.ok(p.primaryEffects.every(v=>v.impact==='threat'));
});

test('phase 2368 chooses the two strongest threats by magnitude with stable source-order ties',async()=>{
  const {projectBossEffectivePressure}=await import(projectionUrl.href);
  const p=projectBossEffectivePressure({
    bossDamageTakenMultiplier:.88,
    specialCadenceMultiplier:.88,
    summonCountMultiplier:1.20,
    dashDistanceMultiplier:1.20,
  });
  assert.deepEqual(p.primaryEffects.map(v=>v.effectId),['summon-pressure','dash-distance']);
  assert.ok(p.primaryEffects.every(v=>v.impact==='threat'));
  const tie=projectBossEffectivePressure({bossDamageTakenMultiplier:.80,specialCadenceMultiplier:.80,summonCountMultiplier:1,dashDistanceMultiplier:1});
  assert.deepEqual(tie.primaryEffects.map(v=>v.effectId),['special-cadence','boss-vulnerability']);
});

test('phase 2369 preserves one-threat and no-threat compatibility',async()=>{
  const {projectBossEffectivePressure}=await import(projectionUrl.href);
  const one=projectBossEffectivePressure({bossDamageTakenMultiplier:1.50,specialCadenceMultiplier:.98,summonCountMultiplier:.70,dashDistanceMultiplier:1});
  assert.deepEqual(one.primaryEffects.map(v=>v.effectId),['special-cadence','boss-vulnerability']);
  const none=projectBossEffectivePressure({bossDamageTakenMultiplier:1.18,specialCadenceMultiplier:1.32,summonCountMultiplier:.90,dashDistanceMultiplier:.80});
  assert.deepEqual(none.primaryEffects.map(v=>v.effectId),['special-cadence','dash-distance']);
});
