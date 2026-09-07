import test from 'node:test';
import assert from 'node:assert/strict';
import { threatLevelModifiers } from '../dist/domain/threat-level.js';
import { composeThreatPressure } from '../dist/game/phase14-runtime.js';
import { projectBalanceAt } from '../dist/game/balance-simulator.js';

const expected=[
  {spawn:.80,elite:1.18,speed:.94,projectile:.88,cadence:1.14,variant:0,shards:1.00},
  {spawn:.90,elite:1.08,speed:.97,projectile:.94,cadence:1.07,variant:0,shards:1.17},
  {spawn:1.00,elite:1.00,speed:1.00,projectile:1.00,cadence:1.00,variant:0,shards:1.34},
  {spawn:1.13,elite:.90,speed:1.035,projectile:1.06,cadence:.94,variant:1,shards:1.51},
  {spawn:1.29,elite:.78,speed:1.07,projectile:1.13,cadence:.86,variant:1,shards:1.68},
  {spawn:1.48,elite:.66,speed:1.11,projectile:1.22,cadence:.78,variant:2,shards:1.85},
];

test('Phase 4329-4334 rebases Threat 0-5 around Threat 2 baseline with explicit pressure channels',()=>{
  for(let level=0;level<=5;level++){
    const m=threatLevelModifiers(level),e=expected[level];
    assert.equal(m.spawnPressureMultiplier,e.spawn);
    assert.equal(m.eliteIntervalMultiplier,e.elite);
    assert.equal(m.enemySpeedMultiplier,e.speed);
    assert.equal(m.projectileSpeedMultiplier,e.projectile);
    assert.equal(m.bossSpecialCadenceMultiplier,e.cadence);
    assert.equal(m.bossVariantBonus,e.variant);
    assert.equal(m.shardMultiplier,e.shards);
  }
  assert.ok(threatLevelModifiers(0).spawnPressureMultiplier<1);
  assert.ok(threatLevelModifiers(1).spawnPressureMultiplier<1);
  assert.equal(threatLevelModifiers(2).spawnPressureMultiplier,1);
});

test('threat composition carries projectile and boss cadence pressure without AUTO/manual coupling',()=>{
  const base={enemySpeedMultiplier:1.05,spawnPressureMultiplier:1.1,eliteIntervalMultiplier:.95};
  const m=threatLevelModifiers(0),out=composeThreatPressure(base,m);
  assert.equal(out.projectileSpeedMultiplier,.88);
  assert.equal(out.bossSpecialCadenceMultiplier,1.14);
  assert.equal('autoModeMultiplier' in out,false);
  assert.equal('manualModeMultiplier' in out,false);
});

test('balance projection preserves sub-baseline T0/T1 pressure instead of clamping them back to 1',()=>{
  const zero=projectBalanceAt(600,0),one=projectBalanceAt(600,1),two=projectBalanceAt(600,2);
  assert.ok(zero.spawnPressure<one.spawnPressure);
  assert.ok(one.spawnPressure<two.spawnPressure);
  assert.ok(zero.spawnPressure<1);
  assert.ok(zero.elitePressure<two.elitePressure);
});

test('control difficulty matrix covers 4 heroes x 6 threats x 3 human/control bands with AUTO between average and skilled manual',async()=>{
  const mod=await import('../dist/game/control-difficulty-matrix-audit.js').catch(()=>({}));
  assert.equal(typeof mod.auditControlDifficultyMatrix,'function');
  const audit=mod.auditControlDifficultyMatrix();
  assert.equal(audit.passed,true);
  assert.equal(audit.samples.length,72);
  assert.equal(audit.pressureMonotonic,true);
  assert.equal(audit.controlOrderingPassed,true);
  assert.ok(audit.autoEfficiency>=.88&&audit.autoEfficiency<=.92);
  assert.ok(audit.averageManualEfficiency<audit.autoEfficiency);
  assert.ok(audit.skilledManualEfficiency>audit.autoEfficiency);
});
