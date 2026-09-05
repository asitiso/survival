import test from 'node:test';
import assert from 'node:assert/strict';
import { longRunMetaDriftSamples, auditLongRunMetaDrift } from '../dist/game/long-run-meta-drift-audit.js';

test('phase 411 long-run meta drift samples cover every hero threat at 2 4 8 and 12 hours',()=>{
  const samples=longRunMetaDriftSamples();
  assert.equal(samples.length,48);
  assert.deepEqual(new Set(samples.map((sample)=>sample.hours)),new Set([2,4,8,12]));
  assert.ok(samples.every((sample)=>sample.topBuildCount>=24));
});

test('phase 412 long runs keep multiple completed-build components viable instead of collapsing to one recipe',()=>{
  for(const sample of longRunMetaDriftSamples()){
    assert.ok(sample.uniqueRelics>=3);
    assert.ok(sample.uniqueFusionPairs>=4);
    assert.ok(sample.uniqueFinalForms>=2);
    assert.ok(sample.uniqueArchetypes>=2);
  }
});

test('phase 413 meta changes gradually between two and twelve hours without concentration spikes',()=>{
  const audit=auditLongRunMetaDrift();
  assert.ok(audit.maxConcentrationDelta<=0.20);
  assert.ok(audit.minTwoToTwelveOverlap>=0.35);
  assert.equal(audit.fixationCount,0);
});

test('phase 414 long-run meta drift audit passes release bounds',()=>{
  assert.equal(auditLongRunMetaDrift().passed,true);
});
