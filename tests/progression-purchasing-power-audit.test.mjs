import test from 'node:test';
import assert from 'node:assert/strict';
import { progressionPurchasingPowerSamples, auditProgressionPurchasingPower } from '../dist/game/progression-purchasing-power-audit.js';

test('phase 391 purchasing-power audit covers 30 60 120 minutes across threat 0 3 5 and three economy bands',()=>{
  const samples=progressionPurchasingPowerSamples();
  assert.equal(samples.length,27);
  assert.deepEqual(new Set(samples.map((sample)=>sample.minute)),new Set([30,60,120]));
  assert.deepEqual(new Set(samples.map((sample)=>sample.threat)),new Set([0,3,5]));
  assert.deepEqual(new Set(samples.map((sample)=>sample.economyBand)),new Set(['conservative','neutral','gold']));
});

test('phase 392 gold xp level and shop purchasing power remain usable together at every checkpoint',()=>{
  for(const sample of progressionPurchasingPowerSamples()){
    assert.ok(sample.estimatedGold>0);
    assert.ok(sample.estimatedLevel>=30);
    assert.ok(sample.shopTokens>=1);
    assert.ok(sample.affordableCorePurchases>=3);
    assert.ok(sample.goldPerAvailableShop>=180);
  }
});

test('phase 393 progression and purchasing power grow monotonically without threat reducing level progress',()=>{
  const audit=auditProgressionPurchasingPower();
  assert.equal(audit.goldMonotonic,true);
  assert.equal(audit.levelMonotonic,true);
  assert.equal(audit.shopPowerMonotonic,true);
  assert.equal(audit.threatLevelParity,true);
  assert.ok(audit.maxEconomyBandSpread<=1.50);
});

test('phase 394 progression purchasing-power audit passes release bounds',()=>{
  assert.equal(auditProgressionPurchasingPower().passed,true);
});
