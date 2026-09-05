import test from 'node:test';
import assert from 'node:assert/strict';
import { releaseManifest } from '../dist/game/release-manifest.js';

const passInput={
  sourceRevision:'abc1234',
  test:{ok:true,count:688},
  buildOk:true,
  raster:{ok:true,signature:'RR-ALL-PASS'},
  release:{ok:true,signature:'RQ-9085A5AD',actionCount:9,profileCount:5},
  foldable:{ok:true,signature:'FT-12345678',reachableActionCount:9,maxLeftTravel:327.5,maxRightTravel:311.2,averageRightTravel:188.4,hingeClear:true},
  baselineMutation:false,
};

test('release manifest passes only when every product gate is green',()=>{
  const manifest=releaseManifest(passInput);
  assert.equal(manifest.ok,true);
  assert.equal(manifest.status,'PASS');
  assert.equal(manifest.exitCode,0);
  assert.equal(manifest.testCount,688);
  assert.equal(manifest.actionCount,9);
  assert.match(manifest.signature,/^RM-[0-9A-F]{8}$/);
  assert.match(manifest.markdown,/Foldable thumb travel/);
});

test('release manifest fails closed on tests build raster release or foldable audit',()=>{
  for(const patch of [
    {test:{ok:false,count:687}},
    {buildOk:false},
    {raster:{ok:false,signature:'RR-BAD'}},
    {release:{ok:false,signature:'RQ-BAD',actionCount:9,profileCount:5}},
    {foldable:{...passInput.foldable,ok:false}},
  ]){
    const manifest=releaseManifest({...passInput,...patch});
    assert.equal(manifest.ok,false);
    assert.equal(manifest.status,'REVIEW');
    assert.equal(manifest.exitCode,2);
    assert.ok(manifest.issues.length>0);
  }
});

test('release manifest rejects baseline mutation and action drift',()=>{
  const manifest=releaseManifest({...passInput,baselineMutation:true,release:{...passInput.release,actionCount:10}});
  assert.equal(manifest.ok,false);
  assert.ok(manifest.issues.some((issue)=>issue.includes('baseline-mutation')));
  assert.ok(manifest.issues.some((issue)=>issue.includes('action-count')));
});

test('release manifest output is deterministic for the same evidence',()=>{
  const a=releaseManifest(passInput),b=releaseManifest(structuredClone(passInput));
  assert.equal(a.signature,b.signature);
  assert.equal(a.markdown,b.markdown);
  assert.deepEqual(a.json,b.json);
});

test('phase 342 manifest carries a compact candidate performance summary without making legacy candidate evidence mandatory',()=>{
  const legacy=releaseManifest(passInput);
  assert.equal(legacy.ok,true);
  const candidateAudit={ok:true,signature:'RCQ-ABCDEF12',issues:[],summary:'low 220/85/47 · mid 320/137/67 · high 420/198/90'};
  const manifest=releaseManifest({...passInput,candidateAudit});
  assert.equal(manifest.ok,true);
  assert.match(manifest.markdown,/Candidate budgets \| low 220\/85\/47/);
  assert.equal(manifest.json.evidence.candidateAudit.summary,candidateAudit.summary);
});

test('phase 382 manifest preserves expanded combination release summary through candidate evidence',()=>{
  const summary='matrix 1.2156 · reward fair 1/1 · reserve 0.6826/0.7289 · build 20-25m';
  const manifest=releaseManifest({...passInput,candidateAudit:{ok:true,signature:'RCQ-C0FFEE00',issues:[],summary}});
  assert.equal(manifest.ok,true);
  assert.match(manifest.markdown,/matrix 1\.2156/);
  assert.equal(manifest.json.evidence.candidateAudit.summary,summary);
});

test('phase 402 manifest preserves completed-build meta bias summary through candidate evidence',()=>{
  const summary='complete meta 1.2 · boss gap 1.8 · buy power 12 · diversity 0.6';
  const manifest=releaseManifest({...passInput,candidateAudit:{ok:true,signature:'RCQ-META402',issues:[],summary}});
  assert.equal(manifest.ok,true);
  assert.equal(manifest.json.evidence.candidateAudit.summary,summary);
  assert.match(manifest.markdown,/complete meta/);
});

test('phase 422 manifest carries real long-run meta-health candidate summary without another duplicate gate',async()=>{
  const { releaseCandidateAudit, releaseCandidateBudgetSummary }=await import('../dist/game/release-candidate-audit.js');
  const candidate=releaseCandidateAudit();
  const summary=releaseCandidateBudgetSummary(candidate);
  const manifest=releaseManifest({...passInput,candidateAudit:{ok:candidate.ok,signature:candidate.signature,issues:candidate.issues,summary}});
  assert.equal(manifest.ok,true);
  assert.match(manifest.markdown,/pivot/);
  assert.match(manifest.markdown,/gauntlet/);
  assert.match(manifest.markdown,/meta drift/);
  assert.match(manifest.markdown,/long hero/);
});
