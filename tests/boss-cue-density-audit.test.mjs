import test from 'node:test';
import assert from 'node:assert/strict';
import { auditBossCueDensity } from '../dist/game/boss-cue-density-audit.js';
import { collectReleaseCandidateEvidence, releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 523 boss cue density audit covers normal heavy critical and imminent-special frames',()=>{
  const a=auditBossCueDensity();
  assert.ok(a.samples.length>=12);
  assert.deepEqual(new Set(a.samples.map((s)=>s.damageSeverity)),new Set(['none','heavy','critical']));
  assert.ok(a.samples.some((s)=>s.imminentSpecial));
});
test('phase 524 imminent boss frames stay inside a compact readable cue budget',()=>{
  const a=auditBossCueDensity();
  assert.ok(a.maxImminentCueUnits<=6);
  assert.ok(a.maxCriticalCueUnits<=4);
  assert.ok(a.maxProjectileCues<=3);
});
test('phase 525 cue compression never removes the boss response action or all projectile warnings',()=>{
  const a=auditBossCueDensity();
  assert.equal(a.missingResponseCount,0);
  assert.equal(a.zeroThreatWarningCount,0);
});
test('phase 526 release candidate fails closed when boss cue density regresses',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const failed={...evidence,bossCueDensity:{...evidence.bossCueDensity,passed:false,issues:['forced-cue-density']}};
  const audit=releaseCandidateAudit(failed);
  assert.equal(audit.status,'REVIEW');
  assert.ok(audit.issues.includes('boss-cue-density'));
});
