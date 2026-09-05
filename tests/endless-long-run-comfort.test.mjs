import test from 'node:test';
import assert from 'node:assert/strict';
import { longRunComfortPolicy } from '../dist/game/endless/long-run-comfort.js';

test('phase 131 long-run comfort gradually reduces presentation density after two hours',()=>{
  const fresh=longRunComfortPolicy(90*60);
  const two=longRunComfortPolicy(2*60*60);
  const four=longRunComfortPolicy(4*60*60);
  const eight=longRunComfortPolicy(8*60*60);
  assert.equal(fresh.tier,0);
  assert.ok(two.vfxDensity<=fresh.vfxDensity);
  assert.ok(four.vfxDensity<two.vfxDensity);
  assert.ok(eight.vfxDensity<=four.vfxDensity);
  assert.ok(eight.maxBuildLabels<=3);
});

test('comfort policy never suppresses danger telegraphs or changes combat pressure',()=>{
  for(const seconds of [0,7200,14400,28800,43200]){
    const p=longRunComfortPolicy(seconds);
    assert.equal(p.dangerTelegraphMultiplier,1);
    assert.equal(p.enemyPressureMultiplier,1);
    assert.ok(p.vfxDensity>=0.62);
    assert.ok(p.notificationCadenceMultiplier>=1&&p.notificationCadenceMultiplier<=1.8);
  }
});
