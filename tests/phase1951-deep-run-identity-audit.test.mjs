import test from 'node:test';
import assert from 'node:assert/strict';
import { auditDeepRunDecisionIdentityAssets } from '../dist/game/deep-run-decision-identity-asset-audit.js';

test('phase 1951 deep-run decision identity audit locks 70 deterministic presentation samples', () => {
  const audit=auditDeepRunDecisionIdentityAssets();
  assert.equal(audit.samples.length,70);
  assert.equal(audit.identityCount,35);
  assert.equal(audit.coverage,1);
  assert.equal(audit.uniqueCellCount,35);
  assert.deepEqual(audit.outOfBounds,[]);
  assert.equal(audit.primaryCoverage,1);
  assert.equal(audit.fallbackCoverage,1);
  assert.equal(audit.motionAmplitude,0);
  assert.equal(audit.textFallbackPreserved,true);
  assert.equal(audit.imageLoadFailureNonBlocking,true);
  assert.equal(audit.actionCount,9);
  assert.equal(audit.snapshotSchemaMutation,false);
  assert.deepEqual(audit.issues,[]);
  assert.equal(audit.passed,true);
});

test('phase 1951 each of the 35 identities has one primary and one fallback sample', () => {
  const audit=auditDeepRunDecisionIdentityAssets();
  const grouped=new Map();
  for(const sample of audit.samples){
    const row=grouped.get(sample.key)??[];row.push(sample.surface);grouped.set(sample.key,row);
    assert.equal(sample.atlasMatch,true);
    assert.equal(sample.motionAmplitude,0);
    assert.equal(sample.textFallbackPreserved,true);
    assert.equal(sample.imageLoadFailureNonBlocking,true);
    assert.equal(sample.passed,true);
  }
  assert.equal(grouped.size,35);
  for(const surfaces of grouped.values()) assert.deepEqual([...surfaces].sort(),['fallback','primary']);
});
