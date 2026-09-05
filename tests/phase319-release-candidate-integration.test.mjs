import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { releaseManifest } from '../dist/game/release-manifest.js';

const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));
const manifestSource=fs.readFileSync(new URL('../scripts/release-manifest.mjs',import.meta.url),'utf8');
const verificationPlanSource=fs.readFileSync(new URL('../scripts/release-verification-plan.mjs',import.meta.url),'utf8');

test('phase 321 repository exposes candidate audit command and production manifest consumes it',()=>{
  assert.equal(pkg.scripts['verify:candidate'],'npm run build && node scripts/release-candidate-audit.mjs');
  assert.match(verificationPlanSource,/release-candidate-audit\.mjs/);
  assert.match(manifestSource,/releaseCandidateAudit/);
  assert.match(manifestSource,/candidateAudit/);
});

test('phase 322 release manifest remains backward compatible but fails closed when supplied candidate audit fails',()=>{
  const base={
    sourceRevision:'abc1234',test:{ok:true,count:700},buildOk:true,
    raster:{ok:true,signature:'RR'},release:{ok:true,signature:'RQ',actionCount:9,profileCount:5},
    foldable:{ok:true,signature:'FT',reachableActionCount:9,maxLeftTravel:300,maxRightTravel:300,averageRightTravel:180,hingeClear:true},
    baselineMutation:false,
  };
  assert.equal(releaseManifest(base).ok,true);
  const pass=releaseManifest({...base,candidateAudit:{ok:true,signature:'RCQ-12345678',issues:[]}});
  assert.equal(pass.ok,true);
  assert.match(pass.markdown,/Candidate balance\/performance/);
  const fail=releaseManifest({...base,candidateAudit:{ok:false,signature:'RCQ-BAD00000',issues:['thermal-budget']}});
  assert.equal(fail.ok,false);
  assert.ok(fail.issues.some((issue)=>issue.includes('candidate-audit')));
});

test('phase 362 release manifest preserves hero balance-lock evidence through the existing candidate summary channel',()=>{
  const base={
    sourceRevision:'phase362',test:{ok:true,count:749},buildOk:true,
    raster:{ok:true,signature:'RR'},release:{ok:true,signature:'RQ',actionCount:9,profileCount:5},
    foldable:{ok:true,signature:'FT',reachableActionCount:9,maxLeftTravel:300,maxRightTravel:300,averageRightTravel:180,hingeClear:true},
    baselineMutation:false,
    candidateAudit:{ok:true,signature:'RCQ-HEROLOCK',issues:[],summary:'low 220/85/47 · hero role 1.0551 · boss TTK 1.274 · damage H/C 1.273/1.364 · thermal 48/20/24'},
  };
  const manifest=releaseManifest(base);
  assert.equal(manifest.ok,true);
  assert.match(manifest.markdown,/hero role 1\.0551/);
  assert.equal(manifest.json.evidence.candidateAudit.summary,base.candidateAudit.summary);
});
