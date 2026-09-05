import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCandidateCliEvidence, auditCandidateCliConsistency } from '../scripts/candidate-cli-evidence.mjs';

test('phase 812 parses machine-readable candidate CLI evidence',()=>{
  const parsed=parseCandidateCliEvidence('header\nCANDIDATE_AUDIT_EVIDENCE {"ok":true,"signature":"RCQ-1234ABCD","issues":[]}\n');
  assert.deepEqual(parsed,{ok:true,signature:'RCQ-1234ABCD',issues:[]});
});

test('phase 813 missing candidate CLI evidence fails closed',()=>{
  const audit=auditCandidateCliConsistency(null,{ok:true,signature:'RCQ-1234ABCD',issues:[]});
  assert.equal(audit.passed,false);
  assert.ok(audit.issues.includes('candidate-cli-evidence-missing'));
});

test('phase 814 candidate CLI signature mismatch fails closed',()=>{
  const audit=auditCandidateCliConsistency(
    {ok:true,signature:'RCQ-AAAAAAAA',issues:[]},
    {ok:true,signature:'RCQ-BBBBBBBB',issues:[]},
  );
  assert.equal(audit.passed,false);
  assert.ok(audit.issues.includes('candidate-cli-signature-mismatch'));
});

test('phase 815 candidate CLI ok mismatch fails closed',()=>{
  const audit=auditCandidateCliConsistency(
    {ok:true,signature:'RCQ-1234ABCD',issues:[]},
    {ok:false,signature:'RCQ-1234ABCD',issues:[]},
  );
  assert.equal(audit.passed,false);
  assert.ok(audit.issues.includes('candidate-cli-status-mismatch'));
});

test('phase 816 candidate CLI issues mismatch fails closed while issue ordering is ignored',()=>{
  const mismatch=auditCandidateCliConsistency(
    {ok:false,signature:'RCQ-1234ABCD',issues:['release-freeze']},
    {ok:false,signature:'RCQ-1234ABCD',issues:['release-freeze','thermal-budget']},
  );
  assert.equal(mismatch.passed,false);
  assert.ok(mismatch.issues.includes('candidate-cli-issues-mismatch'));
  const reordered=auditCandidateCliConsistency(
    {ok:false,signature:'RCQ-1234ABCD',issues:['thermal-budget','release-freeze']},
    {ok:false,signature:'RCQ-1234ABCD',issues:['release-freeze','thermal-budget']},
  );
  assert.equal(reordered.passed,true);
});
