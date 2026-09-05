import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const freezeSource=fs.readFileSync(new URL('../src/game/release-freeze-audit.ts',import.meta.url),'utf8');
const candidateSource=fs.readFileSync(new URL('../src/game/release-candidate-audit.ts',import.meta.url),'utf8');

test('phase 1894 release freeze source binds secondary combat motion evidence',()=>{
  assert.match(freezeSource,/secondaryCombatMotionPassed/);
  assert.match(freezeSource,/secondaryCombatMotionSamples/);
  assert.match(candidateSource,/secondaryCombatMotionPassed/);
  assert.match(candidateSource,/secondaryCombatMotionSamples/);
  assert.match(candidateSource,/secondary-combat-motion/);
});

test('phase 1894 release freeze carries 48 secondary combat motion samples',async()=>{
  const {auditReleaseFreeze}=await import('../dist/game/release-freeze-audit.js');
  const freeze=auditReleaseFreeze();
  assert.equal(freeze.secondaryCombatMotionPassed,true);
  assert.equal(freeze.secondaryCombatMotionSamples,48);
  assert.equal(freeze.passed,true);
});

test('phase 1894 candidate fails closed when secondary combat motion evidence is forged',async()=>{
  const {collectReleaseCandidateEvidence,releaseCandidateAudit}=await import('../dist/game/release-candidate-audit.js');
  const evidence=collectReleaseCandidateEvidence();
  const forged=releaseCandidateAudit({...evidence,releaseFreeze:{...evidence.releaseFreeze,secondaryCombatMotionPassed:false,passed:true}});
  assert.equal(forged.status,'REVIEW');
  assert.ok(forged.issues.includes('release-freeze'));
});

test('phase 1894 candidate signature binds secondary combat motion sample count',async()=>{
  const {collectReleaseCandidateEvidence,releaseCandidateAudit}=await import('../dist/game/release-candidate-audit.js');
  const evidence=collectReleaseCandidateEvidence();
  const base=releaseCandidateAudit(evidence);
  const changed=releaseCandidateAudit({...evidence,releaseFreeze:{...evidence.releaseFreeze,secondaryCombatMotionSamples:evidence.releaseFreeze.secondaryCombatMotionSamples+1}});
  assert.equal(base.status,'PASS');
  assert.notEqual(base.signature,changed.signature);
});
