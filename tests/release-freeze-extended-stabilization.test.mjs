import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { discoverTestFiles, createTestExecutionPlan } from '../scripts/verify-tests-parallel.mjs';
import { browserLifecyclePolicy } from '../dist/game/browser-lifecycle-policy.js';
import { auditBfcacheResume } from '../dist/game/bfcache-resume-audit.js';
import { auditLongHorizonResume } from '../dist/game/long-horizon-resume-audit.js';
import { auditViewportStorm } from '../dist/game/viewport-storm-audit.js';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { evaluateArchiveProvenance } from '../dist/game/archive-provenance.js';
import { releaseVerificationPlan } from '../scripts/release-verification-plan.mjs';
import { releaseManifest } from '../dist/game/release-manifest.js';

const provenanceGood={sourceRevision:'a'.repeat(40),archiveComment:'a'.repeat(40),criticalFileCount:6,matchingCriticalFiles:6,dirty:false,archiveErrors:0};
const manifestBase={sourceRevision:'abc',test:{ok:true,count:1169},buildOk:true,raster:{ok:true,signature:'R'},release:{ok:true,signature:'Q',actionCount:9,profileCount:5},foldable:{ok:true,signature:'F',reachableActionCount:9,maxLeftTravel:1,maxRightTravel:1,averageRightTravel:1,hingeClear:true},baselineMutation:false};

test('phase 763 parallel verifier discovers test files in deterministic order',()=>{const files=discoverTestFiles(new URL('../tests/',import.meta.url));assert.ok(files.length>=287);assert.deepEqual(files,[...files].sort());});
test('phase 764 parallel verifier uses a bounded worker count',()=>{const plan=createTestExecutionPlan(['a.test.mjs','b.test.mjs'],99);assert.ok(plan.workerCount>=1);assert.ok(plan.workerCount<=8);});
test('phase 765 shared-output tests are isolated in an exclusive lane',()=>{const plan=createTestExecutionPlan(['normal.test.mjs','phase299-release-manifest-integration.test.mjs','render-raster-ci-summary.test.mjs'],4);assert.deepEqual(plan.parallel,['normal.test.mjs']);assert.equal(plan.exclusive.length,2);});
test('phase 766 test execution plan covers every discovered test exactly once',()=>{const files=discoverTestFiles(new URL('../tests/',import.meta.url));const p=createTestExecutionPlan(files,4);const all=[...p.parallel,...p.exclusive];assert.equal(all.length,files.length);assert.equal(new Set(all).size,files.length);});

test('phase 767 pageshow lifecycle policy resets transient input before visibility synchronization',()=>{const p=browserLifecyclePolicy('pageshow');assert.equal(p.resetTransient,true);assert.equal(p.syncVisibility,true);assert.equal(p.checkpoint,false);});
test('phase 768 BFCache resume never creates a new run or duplicate checkpoint',()=>{const a=auditBfcacheResume();assert.equal(a.newRunCount,0);assert.equal(a.checkpointWriteCount,0);assert.equal(a.passed,true);});
test('phase 769 BFCache audit preserves action surface and reset ordering',()=>{const a=auditBfcacheResume();assert.equal(a.actionCount,9);assert.equal(a.inputResetBeforeResume,true);assert.equal(a.passed,true);});
test('phase 770 release freeze requires BFCache resume evidence',()=>{const a=auditReleaseFreeze();assert.equal(a.bfcacheResumePassed,true);assert.equal(a.passed,true);});

test('phase 771 long-horizon resume preserves two-hour snapshots with zero drift',()=>{const a=auditLongHorizonResume();assert.equal(a.checkpoints.find(x=>x.hours===2)?.maxElapsedDrift,0);});
test('phase 772 long-horizon resume covers 2 4 8 and 12 hours across all four heroes',()=>{const a=auditLongHorizonResume();assert.equal(a.samples,16);assert.deepEqual(a.checkpoints.map(x=>x.hours),[2,4,8,12]);assert.equal(a.primaryRoundTripCoverage,1);});
test('phase 773 journal recovery preserves the latest 12-hour checkpoint with zero drift',()=>{const a=auditLongHorizonResume();assert.equal(a.journalRecoveryCoverage,1);assert.equal(a.maxElapsedDrift,0);assert.equal(a.latestTwelveHourCheckpointPreserved,true);});
test('phase 774 release freeze requires long-horizon resume evidence',()=>{const a=auditReleaseFreeze();assert.equal(a.longHorizonResumePassed,true);assert.equal(a.passed,true);});

test('phase 775 viewport storm covers twenty-four transitions including three zero-size frames',()=>{const a=auditViewportStorm();assert.equal(a.transitionCount,24);assert.equal(a.zeroSizeTransitions,3);assert.equal(a.finitePointerCoverage,1);});
test('phase 776 viewport storm keeps all nine actions reachable and foldable hinge clear',()=>{const a=auditViewportStorm();assert.equal(a.reachableActionCount,9);assert.equal(a.hingeClear,true);assert.equal(a.passed,true);});
test('phase 777 viewport storm lifecycle resets transient input without persistence writes',()=>{const a=auditViewportStorm();assert.equal(a.transientResetCoverage,1);assert.equal(a.persistenceWriteCount,0);assert.equal(a.passed,true);});
test('phase 778 release freeze requires viewport-storm evidence',()=>{const a=auditReleaseFreeze();assert.equal(a.viewportStormPassed,true);assert.equal(a.passed,true);});

test('phase 779 archive provenance passes only when revision critical files and clean tree agree',()=>{const a=evaluateArchiveProvenance(provenanceGood);assert.equal(a.passed,true);assert.equal(a.criticalFileCoverage,1);});
test('phase 780 archive provenance fails closed on revision mismatch or critical-file drift',()=>{const rev=evaluateArchiveProvenance({...provenanceGood,archiveComment:'b'.repeat(40)});const drift=evaluateArchiveProvenance({...provenanceGood,matchingCriticalFiles:5});assert.equal(rev.passed,false);assert.equal(drift.passed,false);});
test('phase 781 archive provenance fails closed on a dirty source tree',()=>{const a=evaluateArchiveProvenance({...provenanceGood,dirty:true});assert.equal(a.passed,false);assert.ok(a.issues.includes('source-dirty'));});
test('phase 782 manifest runs provenance after archive and fails closed when provenance is unhealthy',()=>{const kinds=releaseVerificationPlan().map(x=>x.kind);assert.deepEqual(kinds.slice(-4),['archive','provenance','package','runCycle']);const bad=evaluateArchiveProvenance({...provenanceGood,dirty:true});const m=releaseManifest({...manifestBase,archiveProvenance:bad});assert.equal(m.ok,false);assert.ok(m.issues.includes('archive-provenance'));});
