import test from 'node:test';
import assert from 'node:assert/strict';
import { HERO_PROFILES } from '../dist/game/hero-profiles.js';
import { longHorizonFailureMarginSamples, auditLongHorizonFailureMargin } from '../dist/game/long-horizon-failure-margin-audit.js';

test('phase 371 long-horizon margin samples 4 heroes x 3 threats x 30 60 120 minutes',()=>{
  const samples=longHorizonFailureMarginSamples();
  assert.equal(samples.length,36);
  assert.deepEqual([...new Set(samples.map((sample)=>sample.minute))],[30,60,120]);
  assert.deepEqual([...new Set(samples.map((sample)=>sample.threat))],[0,3,5]);
});

test('phase 372 hero and core reserve margins stay positive and fall monotonically with threat',()=>{
  const samples=longHorizonFailureMarginSamples();
  assert.ok(samples.every((sample)=>sample.heroReserveMargin>0&&sample.coreReserveMargin>0&&sample.pressureIndex>0));
  for(const hero of HERO_PROFILES)for(const minute of [30,60,120]){
    const group=samples.filter((sample)=>sample.heroId===hero.id&&sample.minute===minute).sort((a,b)=>a.threat-b.threat);
    assert.ok(group[0].heroReserveMargin>group[1].heroReserveMargin&&group[1].heroReserveMargin>group[2].heroReserveMargin);
    assert.ok(group[0].coreReserveMargin>group[1].coreReserveMargin&&group[1].coreReserveMargin>group[2].coreReserveMargin);
  }
});

test('phase 373 long-horizon release margin remains bounded through two hours',()=>{
  const audit=auditLongHorizonFailureMargin();
  assert.equal(audit.passed,true);
  assert.ok(audit.minHeroReserveMargin>=0.62);
  assert.ok(audit.minCoreReserveMargin>=0.62);
  assert.ok(audit.maxHeroSpread<=1.60);
  assert.ok(audit.maxCoreSpread<=1.85);
});

test('phase 374 edric remains the strongest core reserve without making other heroes release traps',()=>{
  const audit=auditLongHorizonFailureMargin();
  assert.equal(audit.edricCoreLeader,true);
  const hardest=audit.samples.filter((sample)=>sample.threat===5&&sample.minute===120);
  const edric=hardest.find((sample)=>sample.heroId==='edric');
  assert.ok(edric);
  assert.equal(edric.coreReserveMargin,Math.max(...hardest.map((sample)=>sample.coreReserveMargin)));
  assert.ok(hardest.every((sample)=>sample.coreReserveMargin>=0.62));
});
