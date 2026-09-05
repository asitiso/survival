import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateArchiveReproducibility } from '../dist/game/archive-reproducibility.js';
import { releaseManifest } from '../dist/game/release-manifest.js';

const good={sourceRevision:'abc1234',firstSha256:'A'.repeat(64),secondSha256:'A'.repeat(64),firstEntryCount:780,secondEntryCount:780,trackedFileCount:710,firstComment:'abc1234',secondComment:'abc1234',missingTrackedFiles:0,unexpectedFiles:0,archiveErrors:0};
const passInput={sourceRevision:'abc1234',test:{ok:true,count:929},buildOk:true,raster:{ok:true,signature:'RR'},release:{ok:true,signature:'RQ',actionCount:9,profileCount:5},foldable:{ok:true,signature:'FT',reachableActionCount:9,maxLeftTravel:1,maxRightTravel:1,averageRightTravel:1,hingeClear:true},baselineMutation:false};

test('phase 539 identical tracked-source archives produce a reproducible PASS evidence record',()=>{
  const a=evaluateArchiveReproducibility(good);
  assert.equal(a.passed,true);
  assert.equal(a.hashMatch,true);
  assert.equal(a.entryCountMatch,true);
});
test('phase 540 byte hash or entry-count drift fails archive reproducibility closed',()=>{
  const hash=evaluateArchiveReproducibility({...good,secondSha256:'B'.repeat(64)});
  const count=evaluateArchiveReproducibility({...good,secondEntryCount:781});
  assert.equal(hash.passed,false);assert.ok(hash.issues.includes('archive-hash-drift'));
  assert.equal(count.passed,false);assert.ok(count.issues.includes('archive-entry-drift'));
});
test('phase 541 archive comment must preserve the source revision and tracked files must not disappear',()=>{
  const a=evaluateArchiveReproducibility({...good,secondComment:'wrong',missingTrackedFiles:1});
  assert.equal(a.passed,false);
  assert.ok(a.issues.includes('archive-source-comment'));
  assert.ok(a.issues.includes('archive-missing-tracked'));
});
test('phase 542 release manifest fails closed when archive reproducibility evidence is supplied and fails',()=>{
  const bad=evaluateArchiveReproducibility({...good,secondSha256:'B'.repeat(64)});
  const manifest=releaseManifest({...passInput,archiveReproducibility:bad});
  assert.equal(manifest.status,'REVIEW');
  assert.ok(manifest.issues.includes('archive-reproducibility'));
});
