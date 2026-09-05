import test from 'node:test';
import assert from 'node:assert/strict';
import { firstThirtyMinuteProfile, auditFirstThirtyMinutes } from '../dist/game/first-thirty-minute-director.js';

test('phase 303 first thirty minute extension is neutral before ten minutes and after thirty',()=>{
  assert.deepEqual(firstThirtyMinuteProfile(599),{band:'neutral',spawnPressureMultiplier:1,eliteIntervalMultiplier:1,rewardMultiplier:1,shopIntervalMultiplier:1,enemyBudgetMultiplier:1});
  assert.deepEqual(firstThirtyMinuteProfile(1800),{band:'neutral',spawnPressureMultiplier:1,eliteIntervalMultiplier:1,rewardMultiplier:1,shopIntervalMultiplier:1,enemyBudgetMultiplier:1});
});

test('phase 304 minutes ten through thirty keep a gentle rising action curve without economy inflation',()=>{
  const settle=firstThirtyMinuteProfile(600);
  const build=firstThirtyMinuteProfile(1000);
  const ready=firstThirtyMinuteProfile(1500);
  assert.equal(settle.band,'settle');
  assert.equal(build.band,'build_test');
  assert.equal(ready.band,'boss_ready');
  assert.ok(settle.spawnPressureMultiplier < build.spawnPressureMultiplier);
  assert.ok(build.spawnPressureMultiplier < ready.spawnPressureMultiplier);
  for(const profile of [settle,build,ready]){
    assert.ok(profile.spawnPressureMultiplier>=1&&profile.spawnPressureMultiplier<=1.04);
    assert.ok(profile.eliteIntervalMultiplier>=.94&&profile.eliteIntervalMultiplier<=1);
    assert.ok(profile.rewardMultiplier>=1&&profile.rewardMultiplier<=1.03);
    assert.equal(profile.shopIntervalMultiplier,1);
    assert.equal(profile.enemyBudgetMultiplier,1);
  }
});

test('phase 305 first thirty minute audit has no post-opening cliff and stays within release bounds',()=>{
  const audit=auditFirstThirtyMinutes();
  assert.deepEqual(audit.checkpoints.map((point)=>point.minute),[2,5,10,15,20,30]);
  assert.equal(audit.noPressureCliff,true);
  assert.equal(audit.rewardBounded,true);
  assert.equal(audit.shopBudgetStable,true);
  assert.equal(audit.passed,true);
});

import fs from 'node:fs';

test('phase 306 game composes first thirty minute pacing into pressure and death rewards without new budget controls',()=>{
  const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(source,/firstThirtyMinuteProfile\(this\.elapsed\)/);
  assert.match(source,/openingPacing\.spawnPressureMultiplier \* firstThirty\.spawnPressureMultiplier/);
  assert.match(source,/openingPacing\.eliteIntervalMultiplier \* firstThirty\.eliteIntervalMultiplier/);
  assert.match(source,/openingCombatPacing\(this\.elapsed\)\.rewardMultiplier \* openingWaveCeremony\(this\.elapsed\)\.rewardPulse \* firstThirtyMinuteProfile\(this\.elapsed\)\.rewardMultiplier/);
  assert.doesNotMatch(source,/firstThirty\.enemyBudgetMultiplier/);
  assert.doesNotMatch(source,/firstThirty\.shopIntervalMultiplier/);
});
