import test from 'node:test';
import assert from 'node:assert/strict';
import { buildChoiceDiversitySamples, auditBuildChoiceDiversity } from '../dist/game/build-choice-diversity-audit.js';

test('phase 395 long-run diversity samples rank top completed builds for every hero and threat checkpoint',()=>{
  const samples=buildChoiceDiversitySamples();
  assert.equal(samples.length,36);
  assert.deepEqual(new Set(samples.map((sample)=>sample.minute)),new Set([30,60,120]));
  assert.ok(samples.every((sample)=>sample.topBuildCount>=12));
});

test('phase 396 top build sets keep multiple relic fusion final-form and archetype choices alive',()=>{
  for(const sample of buildChoiceDiversitySamples()){
    assert.ok(sample.uniqueRelics>=3);
    assert.ok(sample.uniqueFusionPairs>=4);
    assert.ok(sample.uniqueFinalForms>=2);
    assert.ok(sample.uniqueArchetypes>=2);
  }
});

test('phase 397 no single completed-build component owns the long-run top meta',()=>{
  const audit=auditBuildChoiceDiversity();
  assert.ok(audit.maxRelicConcentration<=0.75);
  assert.ok(audit.maxFusionPairConcentration<=0.65);
  assert.ok(audit.maxFinalFormConcentration<=0.75);
  assert.ok(audit.maxArchetypeConcentration<=0.75);
  assert.equal(audit.fixationCount,0);
});

test('phase 398 build choice diversity audit passes release bounds',()=>{
  assert.equal(auditBuildChoiceDiversity().passed,true);
});
