import test from 'node:test';
import assert from 'node:assert/strict';
import { completedBuildMetaSamples, auditCompletedBuildMeta } from '../dist/game/completed-build-meta-audit.js';

test('phase 383 completed build meta audit covers hero relic fusion-pair final-form archetype and threat space',()=>{
  const samples=completedBuildMetaSamples();
  assert.equal(samples.length,17280);
  assert.deepEqual(new Set(samples.map((sample)=>sample.heroId)),new Set(['arkan','seria','kain','edric']));
  assert.deepEqual(new Set(samples.map((sample)=>sample.threat)),new Set([0,3,5]));
  assert.ok(samples.every((sample)=>sample.fusionIds.length===2));
  assert.equal(new Set(samples.map((sample)=>sample.finalFormId)).size,12);
});

test('phase 384 completed build samples are finite and retain meaningful offensive defensive and economy axes',()=>{
  const samples=completedBuildMetaSamples();
  for(const sample of samples){
    assert.ok(Number.isFinite(sample.offenseIndex)&&sample.offenseIndex>0);
    assert.ok(Number.isFinite(sample.survivalIndex)&&sample.survivalIndex>0);
    assert.ok(Number.isFinite(sample.coreGuardIndex)&&sample.coreGuardIndex>0);
    assert.ok(Number.isFinite(sample.economyIndex)&&sample.economyIndex>0);
    assert.ok(Number.isFinite(sample.compositeIndex)&&sample.compositeIndex>0);
  }
  assert.ok(new Set(samples.map((sample)=>sample.relicId)).size>=8);
  assert.ok(new Set(samples.map((sample)=>sample.archetype)).size===4);
});

test('phase 385 completed-build meta does not create hero release traps or a single runaway top hero',()=>{
  const audit=auditCompletedBuildMeta();
  assert.equal(audit.trapCount,0);
  assert.ok(audit.maxHeroTopSpread<=1.35);
  assert.ok(audit.maxWithinHeroSpread<=2.10);
  assert.ok(audit.minThreatFiveMargin>=0.62);
  assert.equal(audit.threatMonotonic,true);
});

test('phase 386 completed-build meta audit passes release bounds',()=>{
  const audit=auditCompletedBuildMeta();
  assert.equal(audit.passed,true);
});
