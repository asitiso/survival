import test from 'node:test';
import assert from 'node:assert/strict';
import { openingCombatPacing } from '../dist/game/opening-pacing.js';

test('phase 135 first ten minutes have three readable pacing bands then return neutral',()=>{
  assert.equal(openingCombatPacing(30).band,'ignition');
  assert.equal(openingCombatPacing(180).band,'momentum');
  assert.equal(openingCombatPacing(420).band,'escalation');
  assert.equal(openingCombatPacing(601).band,'standard');
});

test('opening pacing increases action modestly without changing shop timing or mobile caps',()=>{
  for(const seconds of [0,60,180,420,599]){
    const p=openingCombatPacing(seconds);
    assert.ok(p.spawnPressureMultiplier>=1&&p.spawnPressureMultiplier<=1.15);
    assert.ok(p.eliteIntervalMultiplier>=0.86&&p.eliteIntervalMultiplier<=1);
    assert.ok(p.rewardMultiplier>=1&&p.rewardMultiplier<=1.1);
    assert.equal(p.shopIntervalMultiplier,1);
    assert.equal(p.enemyBudgetMultiplier,1);
  }
  const normal=openingCombatPacing(600);
  assert.deepEqual(normal,{band:'standard',spawnPressureMultiplier:1,eliteIntervalMultiplier:1,rewardMultiplier:1,shopIntervalMultiplier:1,enemyBudgetMultiplier:1});
});
