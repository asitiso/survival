import test from 'node:test';
import assert from 'node:assert/strict';
const projectionUrl=new URL('../dist/game/endless/boss-effective-pressure-projection.js',import.meta.url);

test('phase 2359 keeps at least one visible threat when larger opportunities would otherwise fill both slots',async()=>{
  const {projectBossEffectivePressure}=await import(projectionUrl.href);
  const p=projectBossEffectivePressure({
    bossDamageTakenMultiplier:1.30,
    specialCadenceMultiplier:.98,
    summonCountMultiplier:.72,
    dashDistanceMultiplier:1,
  });
  assert.equal(p.primaryEffects.length,2);
  assert.equal(p.primaryEffects[0].effectId,'special-cadence');
  assert.equal(p.primaryEffects[0].impact,'threat');
  assert.equal(p.primaryEffects[1].effectId,'boss-vulnerability');
  assert.equal(p.primaryEffects[1].impact,'opportunity');
});

test('phase 2360 chooses the strongest threat first and then the strongest remaining effect',async()=>{
  const {projectBossEffectivePressure}=await import(projectionUrl.href);
  const p=projectBossEffectivePressure({
    bossDamageTakenMultiplier:1.50,
    specialCadenceMultiplier:1.10,
    summonCountMultiplier:1.12,
    dashDistanceMultiplier:.80,
  });
  assert.deepEqual(p.primaryEffects.map(v=>v.effectId),['summon-pressure','boss-vulnerability']);
  assert.equal(p.primaryEffects[0].impact,'threat');
  assert.equal(p.primaryEffects[1].impact,'opportunity');
});

test('phase 2361 preserves the existing magnitude order when no visible threat exists',async()=>{
  const {projectBossEffectivePressure}=await import(projectionUrl.href);
  const p=projectBossEffectivePressure({
    bossDamageTakenMultiplier:1.18,
    specialCadenceMultiplier:1.32,
    summonCountMultiplier:.90,
    dashDistanceMultiplier:.80,
  });
  assert.deepEqual(p.primaryEffects.map(v=>v.effectId),['special-cadence','dash-distance']);
  assert.ok(p.primaryEffects.every(v=>v.impact==='opportunity'));
});
