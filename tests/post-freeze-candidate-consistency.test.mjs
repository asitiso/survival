import test from 'node:test';
import assert from 'node:assert/strict';
import { collectReleaseCandidateEvidence, releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

function mutatedReleaseFreeze(field){
  const e=collectReleaseCandidateEvidence();
  return {...e,releaseFreeze:{...e.releaseFreeze,[field]:false,passed:true}};
}
for (const [phase,field] of [[806,'blockedStorageContinuityPassed'],[807,'journalClockRollbackPassed'],[808,'multiDayPersistencePassed'],[809,'snapshotSchemaGuardPassed'],[810,'postFreezeStabilityPassed']]) {
  test(`phase ${phase} candidate rejects inconsistent release-freeze evidence: ${field}`,()=>{
    const audit=releaseCandidateAudit(mutatedReleaseFreeze(field));
    assert.equal(audit.ok,false);
    assert.ok(audit.issues.includes('release-freeze'));
  });
}

test('phase 811 candidate signature includes post-freeze evidence consistency',()=>{
  const e=collectReleaseCandidateEvidence();
  const healthy=releaseCandidateAudit(e);
  const changed=releaseCandidateAudit({...e,releaseFreeze:{...e.releaseFreeze,blockedStorageContinuityPassed:false,postFreezeStabilityPassed:false,passed:true}});
  assert.notEqual(healthy.signature,changed.signature);
});
