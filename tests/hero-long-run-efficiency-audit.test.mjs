import test from 'node:test';
import assert from 'node:assert/strict';
import { heroLongRunEfficiencySamples, auditHeroLongRunEfficiency } from '../dist/game/hero-long-run-efficiency-audit.js';

test('phase 415 hero long-run efficiency covers four heroes three threats and four long-run checkpoints',()=>{
  const samples=heroLongRunEfficiencySamples();
  assert.equal(samples.length,48);
  assert.deepEqual(new Set(samples.map((sample)=>sample.hours)),new Set([2,4,8,12]));
  assert.ok(samples.every((sample)=>sample.efficiencyIndex>0&&sample.bestBuildScore>0));
});

test('phase 416 long-run best-build efficiency stays inside a fair hero envelope even on threat five',()=>{
  const audit=auditHeroLongRunEfficiency();
  assert.ok(audit.maxHeroEfficiencySpread<=1.20);
  assert.ok(audit.minThreatFiveRetention>=0.75);
});

test('phase 417 threat pressure lowers efficiency monotonically without a late-hour collapse',()=>{
  const audit=auditHeroLongRunEfficiency();
  assert.equal(audit.threatMonotonic,true);
  assert.ok(audit.minTwelveHourRetention>=0.92);
});

test('phase 418 hero long-run efficiency audit passes release bounds',()=>{
  assert.equal(auditHeroLongRunEfficiency().passed,true);
});
