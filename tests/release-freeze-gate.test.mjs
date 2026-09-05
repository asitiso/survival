import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { evaluatePackageRunCycleSmoke } from '../dist/game/package-run-cycle-smoke.js';
import { releaseCandidateAudit, collectReleaseCandidateEvidence } from '../dist/game/release-candidate-audit.js';
import { releaseManifest } from '../dist/game/release-manifest.js';
import { releaseVerificationPlan } from '../scripts/release-verification-plan.mjs';

test('phase 739 release freeze audit requires storage lifecycle low-end and mobile-browser gates together',()=>{const a=auditReleaseFreeze();assert.equal(a.storageFailurePassed,true);assert.equal(a.lifecycleIdempotencyPassed,true);assert.equal(a.lowEndPerformancePassed,true);assert.equal(a.mobileBrowserPassed,true);assert.equal(a.actionCount,9);assert.equal(a.snapshotSchemaMutation,false);assert.equal(a.passed,true);});
test('phase 740 release candidate fails closed when release-freeze evidence regresses',()=>{const e=collectReleaseCandidateEvidence();const broken={...e,releaseFreeze:{...e.releaseFreeze,passed:false}};const a=releaseCandidateAudit(broken);assert.equal(a.ok,false);assert.ok(a.issues.includes('release-freeze'));});
test('phase 741 verification plan runs packaged new-run checkpoint resume smoke after packaged runtime boot',()=>{const kinds=releaseVerificationPlan().map(s=>s.kind);assert.deepEqual(kinds.slice(-4),['archive','provenance','package','runCycle']);const src=fs.readFileSync(new URL('../scripts/release-manifest.mjs',import.meta.url),'utf8');assert.match(src,/PACKAGE_RUN_CYCLE_EVIDENCE/);});
test('phase 742 release manifest fails closed when the final packaged new-game resume cycle is unhealthy',()=>{const packageRunCycle=evaluatePackageRunCycleSmoke({sourceRevision:'abc',archiveComment:'abc',newRunOk:true,checkpointOk:true,resumeOk:false,elapsedDrift:0,endlessStateMatch:true,processExitErrors:0});const base={sourceRevision:'abc',test:{ok:true,count:1129},buildOk:true,raster:{ok:true,signature:'R'},release:{ok:true,signature:'Q',actionCount:9,profileCount:5},foldable:{ok:true,signature:'F',reachableActionCount:9,maxLeftTravel:1,maxRightTravel:1,averageRightTravel:1,hingeClear:true},baselineMutation:false};const m=releaseManifest({...base,packageRunCycle});assert.equal(m.ok,false);assert.ok(m.issues.includes('package-run-cycle'));});
