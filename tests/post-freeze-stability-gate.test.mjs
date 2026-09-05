import test from 'node:test';
import assert from 'node:assert/strict';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { collectReleaseCandidateEvidence, releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 801 release freeze gates blocked-storage continuity',()=>{assert.equal(auditReleaseFreeze().blockedStorageContinuityPassed,true);});
test('phase 802 release freeze gates recovery journal append recency under clock rollback',()=>{assert.equal(auditReleaseFreeze().journalClockRollbackPassed,true);});
test('phase 803 release freeze gates multi-day snapshot and history preservation',()=>{assert.equal(auditReleaseFreeze().multiDayPersistencePassed,true);});
test('phase 804 release freeze gates snapshot schema fail-closed behavior',()=>{assert.equal(auditReleaseFreeze().snapshotSchemaGuardPassed,true);});
test('phase 805 candidate is fail-closed when post-freeze stability evidence fails',()=>{const e=collectReleaseCandidateEvidence();const broken={...e,releaseFreeze:{...e.releaseFreeze,postFreezeStabilityPassed:false,passed:false}};const a=releaseCandidateAudit(broken);assert.equal(a.ok,false);assert.ok(a.issues.includes('release-freeze'));});
