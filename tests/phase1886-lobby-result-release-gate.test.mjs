import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { collectReleaseCandidateEvidence, releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

test('phase 1886 release freeze carries lobby/result identity evidence',()=>{
  const freeze=auditReleaseFreeze();
  assert.equal(freeze.lobbyResultIdentityPassed,true);
  assert.equal(freeze.lobbyResultIdentitySamples,32);
  assert.equal(freeze.passed,true);
});

test('phase 1886 candidate fails closed when lobby/result evidence is forged',()=>{
  const evidence=collectReleaseCandidateEvidence();
  const forged=releaseCandidateAudit({...evidence,releaseFreeze:{...evidence.releaseFreeze,lobbyResultIdentityPassed:false,passed:true}});
  assert.equal(forged.status,'REVIEW');
  assert.ok(forged.issues.includes('release-freeze'));
});

test('phase 1886 candidate signature binds lobby/result sample count',()=>{
  const source=fs.readFileSync(new URL('../src/game/release-candidate-audit.ts',import.meta.url),'utf8');
  assert.match(source,/lobbyResultIdentityPassed/);
  assert.match(source,/lobbyResultIdentitySamples/);
  assert.match(source,/lobby-result-identity/);
  const evidence=collectReleaseCandidateEvidence();
  const base=releaseCandidateAudit(evidence);
  const changed=releaseCandidateAudit({...evidence,releaseFreeze:{...evidence.releaseFreeze,lobbyResultIdentitySamples:evidence.releaseFreeze.lobbyResultIdentitySamples+1}});
  assert.equal(base.status,'PASS');
  assert.notEqual(base.signature,changed.signature);
});
