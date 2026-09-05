import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { longRunRewardDensityPolicy, auditLongRunRewardDensity } from '../dist/game/endless/long-run-reward-density.js';

test('phase 315 long-run reward density is neutral before two hours and bounded afterward',()=>{
  const early=longRunRewardDensityPolicy(7199,0);
  assert.equal(early.goldMultiplier,1);
  assert.equal(early.xpMultiplier,1);
  for(const seconds of [7200,14400,28800,43200]){
    const p=longRunRewardDensityPolicy(seconds,0);
    assert.ok(p.goldMultiplier>=1&&p.goldMultiplier<=1.08);
    assert.ok(p.xpMultiplier>=1&&p.xpMultiplier<=1.08);
  }
});

test('phase 316 high recent reward rate damps the boost instead of compounding economy inflation',()=>{
  const low=longRunRewardDensityPolicy(30000,100);
  const high=longRunRewardDensityPolicy(30000,5000);
  assert.ok(low.goldMultiplier>high.goldMultiplier);
  assert.equal(high.goldMultiplier,1);
  assert.equal(high.xpMultiplier,1);
});

test('phase 317 long-run reward audit stays meaningful without runaway inflation through twelve hours',()=>{
  const audit=auditLongRunRewardDensity();
  assert.deepEqual(audit.checkpoints.map((p)=>p.minute),[120,240,480,720]);
  assert.equal(audit.noDrought,true);
  assert.equal(audit.noInflation,true);
  assert.equal(audit.passed,true);
});

test('phase 318 game tracks transient reward rate and composes long-run reward only into death xp and gold',()=>{
  const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(source,/recentGoldPerMinute/);
  assert.match(source,/updateLongRunRewardRate\(\)/);
  assert.match(source,/longRunRewardDensityPolicy\(this\.elapsed, this\.recentGoldPerMinute\)/);
  assert.match(source,/death\.xp .* longRunReward\.xpMultiplier/);
  assert.match(source,/death\.gold .* longRunReward\.goldMultiplier/);
  assert.doesNotMatch(source,/shopToken.*longRunReward/);
});
