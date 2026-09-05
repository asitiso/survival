import test from 'node:test';
import assert from 'node:assert/strict';
const freezeUrl=new URL('../dist/game/release-freeze-audit.js',import.meta.url);
const candidateUrl=new URL('../dist/game/release-candidate-audit.js',import.meta.url);

test('phase 2390 release freeze binds tactic-link effect projection evidence',async()=>{
  const {auditReleaseFreeze}=await import(freezeUrl.href);const f=auditReleaseFreeze();
  assert.equal(f.mythicTacticAttackLinkProjectionPassed,true);assert.equal(f.mythicTacticAttackLinkProjectionSamples,64);assert.equal(f.passed,true);
});

test('phase 2390 candidate fails closed on forged tactic-link projection evidence and binds sixty-four samples',async()=>{
  const {releaseCandidateAudit}=await import(candidateUrl.href);const base=releaseCandidateAudit();
  const forged=structuredClone(base.evidence);forged.releaseFreeze.mythicTacticAttackLinkProjectionPassed=false;forged.releaseFreeze.passed=true;const bad=releaseCandidateAudit(forged);assert.equal(bad.status,'REVIEW');assert.ok(bad.issues.includes('release-freeze'));
  const changed=structuredClone(base.evidence);changed.releaseFreeze.mythicTacticAttackLinkProjectionSamples+=1;assert.notEqual(releaseCandidateAudit(changed).signature,base.signature);
  assert.match(base.markdown,/mythic-tactic-attack-link-projection safe \(64\)/);
});
