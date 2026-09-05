import test from 'node:test';
import assert from 'node:assert/strict';
import { openingCombatPacing } from '../dist/game/opening-pacing.js';
import { firstThirtyMinuteProfile } from '../dist/game/first-thirty-minute-director.js';
import { openingThirtyTimetableAudit, openingThirtyMinuteSample } from '../dist/game/opening-thirty-timetable.js';

test('phase 323 opening pacing tapers toward the ten minute handoff instead of stepping off a cliff',()=>{
  const atFive=openingCombatPacing(300);
  const atNine=openingCombatPacing(540);
  const beforeTen=openingCombatPacing(599);
  const afterTen=firstThirtyMinuteProfile(600);
  assert.equal(atFive.band,'escalation');
  assert.ok(atFive.spawnPressureMultiplier>=atNine.spawnPressureMultiplier);
  assert.ok(atNine.spawnPressureMultiplier>=beforeTen.spawnPressureMultiplier);
  assert.ok(Math.abs(beforeTen.spawnPressureMultiplier-afterTen.spawnPressureMultiplier)<=.012);
  assert.ok(Math.abs(beforeTen.rewardMultiplier-afterTen.rewardMultiplier)<=.012);
});

test('phase 324 ten through thirty minute tuning interpolates inside bands rather than jumping at each boundary',()=>{
  const a=firstThirtyMinuteProfile(600);
  const b=firstThirtyMinuteProfile(720);
  const c=firstThirtyMinuteProfile(899);
  assert.equal(a.band,'settle');
  assert.equal(b.band,'settle');
  assert.equal(c.band,'settle');
  assert.ok(a.spawnPressureMultiplier<b.spawnPressureMultiplier);
  assert.ok(b.spawnPressureMultiplier<c.spawnPressureMultiplier);
  const before=firstThirtyMinuteProfile(899.9);
  const after=firstThirtyMinuteProfile(900);
  assert.ok(Math.abs(before.spawnPressureMultiplier-after.spawnPressureMultiplier)<=.003);
  assert.ok(Math.abs(before.eliteIntervalMultiplier-after.eliteIntervalMultiplier)<=.003);
});

test('phase 325 minute-resolution opening timetable is bounded and has no non-ceremony pressure cliff',()=>{
  const audit=openingThirtyTimetableAudit();
  assert.equal(audit.samples.length,30);
  assert.deepEqual(audit.samples.map((sample)=>sample.minute),Array.from({length:30},(_,i)=>i));
  assert.equal(audit.noPressureCliff,true);
  assert.equal(audit.rewardBounded,true);
  assert.equal(audit.shopBudgetStable,true);
  assert.ok(audit.maxSpawnDelta<=.04);
  assert.ok(audit.maxRewardDelta<=.025);
  assert.equal(audit.passed,true);
});

test('phase 326 timetable samples expose the same combined runtime multipliers without touching budgets',()=>{
  const sample=openingThirtyMinuteSample(18*60);
  assert.equal(sample.minute,18);
  assert.equal(sample.enemyBudgetMultiplier,1);
  assert.equal(sample.shopIntervalMultiplier,1);
  assert.ok(sample.spawnPressureMultiplier>=1&&sample.spawnPressureMultiplier<=1.12);
  assert.ok(sample.rewardMultiplier>=1&&sample.rewardMultiplier<=1.1);
});
