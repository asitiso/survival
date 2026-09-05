import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { releaseVerificationPlan } from '../scripts/release-verification-plan.mjs';
import { evaluatePackageRuntimeSmoke } from '../dist/game/package-runtime-smoke.js';

test('phase 719 packaged runtime smoke requires root game entry css and new release audit assets from the extracted zip',()=>{
  const audit=evaluatePackageRuntimeSmoke({sourceRevision:'abc1234',archiveComment:'abc1234',requiredPathCount:9,okPathCount:9,httpFailures:0,processExitErrors:0});
  assert.equal(audit.pathCoverage,1);
  assert.equal(audit.commentMatch,true);
});
test('phase 720 packaged runtime smoke fails closed on an http path failure or source-comment mismatch',()=>{
  assert.equal(evaluatePackageRuntimeSmoke({sourceRevision:'abc',archiveComment:'abc',requiredPathCount:9,okPathCount:8,httpFailures:1,processExitErrors:0}).passed,false);
  assert.equal(evaluatePackageRuntimeSmoke({sourceRevision:'abc',archiveComment:'def',requiredPathCount:9,okPathCount:9,httpFailures:0,processExitErrors:0}).passed,false);
});
test('phase 721 release verification plan runs packaged runtime after deterministic archive verification',()=>{
  const kinds=releaseVerificationPlan().map(step=>step.kind);
  assert.deepEqual(kinds,['build','tests','raster','release','candidate','archive','provenance','package','runCycle']);
  const source=fs.readFileSync(new URL('../scripts/release-manifest.mjs',import.meta.url),'utf8');
  assert.match(source,/PACKAGE_RUNTIME_EVIDENCE/);
});
test('phase 722 release manifest fails closed when packaged runtime evidence is not healthy',()=>{
  const source=fs.readFileSync(new URL('../src/game/release-manifest.ts',import.meta.url),'utf8');
  assert.match(source,/packageRuntime/);
  assert.match(source,/package-runtime-smoke/);
});
