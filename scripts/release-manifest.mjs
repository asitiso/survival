import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { releaseVerificationPlan } from './release-verification-plan.mjs';
import { parseCandidateCliEvidence, auditCandidateCliConsistency } from './candidate-cli-evidence.mjs';

function run(step){
  return spawnSync(step.command,step.args,{cwd:process.cwd(),encoding:'utf8',stdio:['ignore','pipe','pipe'],shell:step.shell===true});
}
function hash(text){let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}return(h>>>0).toString(16).padStart(8,'0').toUpperCase();}
function testCount(stdout){const matches=[...String(stdout??'').matchAll(/^# tests (\d+)$/gm)];return matches.length?Number(matches.at(-1)[1]):0;}
function revision(){const r=spawnSync('git',['rev-parse','--short','HEAD'],{cwd:process.cwd(),encoding:'utf8'});return r.status===0?r.stdout.trim():'source';}

const results=new Map();
for(const step of releaseVerificationPlan()){
  const result=run(step);results.set(step.kind,result);
  if(result.status!==0)break;
}
const build=results.get('build')??{status:1,stdout:'',stderr:'build not run'};
const test=results.get('tests')??{status:1,stdout:'',stderr:'tests not run'};
const raster=results.get('raster')??{status:1,stdout:'',stderr:'raster not run'};
const release=results.get('release')??{status:1,stdout:'',stderr:'release not run'};
const candidate=results.get('candidate')??{status:1,stdout:'',stderr:'candidate not run'};
const archive=results.get('archive')??{status:1,stdout:'',stderr:'archive not run'};
const provenance=results.get('provenance')??{status:1,stdout:'',stderr:'provenance not run'};
const packageRuntime=results.get('package')??{status:1,stdout:'',stderr:'package not run'};
const packageRunCycle=results.get('runCycle')??{status:1,stdout:'',stderr:'run cycle not run'};
const archiveMatch=String(archive.stdout??'').match(/^ARCHIVE_EVIDENCE (\{.*\})$/m);
const archiveEvidence=archiveMatch?JSON.parse(archiveMatch[1]):null;
const provenanceMatch=String(provenance.stdout??'').match(/^ARCHIVE_PROVENANCE_EVIDENCE (\{.*\})$/m);
const provenanceEvidence=provenanceMatch?JSON.parse(provenanceMatch[1]):null;
const packageMatch=String(packageRuntime.stdout??'').match(/^PACKAGE_RUNTIME_EVIDENCE (\{.*\})$/m);
const packageEvidence=packageMatch?JSON.parse(packageMatch[1]):null;
const runCycleMatch=String(packageRunCycle.stdout??'').match(/^PACKAGE_RUN_CYCLE_EVIDENCE (\{.*\})$/m);
const packageRunCycleEvidence=runCycleMatch?JSON.parse(runCycleMatch[1]):null;

const [{ releaseManifest },{ releaseCandidateAudit, releaseCandidateBudgetSummary },{ rasterReleaseQualityGate },{ foldableThumbTravelAudit },{ landscapeSafeAreaProfile },{ ACTION_BUTTONS }]=await Promise.all([
  import('../dist/game/release-manifest.js'),
  import('../dist/game/release-candidate-audit.js'),
  import('../dist/game/render-raster-release-gate.js'),
  import('../dist/game/foldable-thumb-travel-audit.js'),
  import('../dist/game/landscape-safe-area.js'),
  import('../dist/game/config.js'),
]);
const releaseGate=rasterReleaseQualityGate();
const candidateAudit=releaseCandidateAudit();
const candidateCliEvidence=parseCandidateCliEvidence(candidate.stdout??'');
const candidateConsistency=auditCandidateCliConsistency(candidateCliEvidence,{ok:candidateAudit.ok,signature:candidateAudit.signature,issues:candidateAudit.issues});
const foldable=foldableThumbTravelAudit(landscapeSafeAreaProfile(2208,1840),ACTION_BUTTONS);
const rasterSignature=`RCI-${hash(raster.stdout??'')}`;
const manifest=releaseManifest({
  sourceRevision:revision(),
  test:{ok:test.status===0,count:testCount(test.stdout)},
  buildOk:build.status===0,
  raster:{ok:raster.status===0,signature:rasterSignature},
  release:{ok:release.status===0&&releaseGate.ok,signature:releaseGate.signature,actionCount:releaseGate.actionCount,profileCount:releaseGate.profileCount},
  foldable,
  baselineMutation:false,
  candidateAudit:{ok:candidate.status===0&&candidateAudit.ok&&candidateConsistency.passed,signature:candidateAudit.signature,issues:[...candidateAudit.issues,...candidateConsistency.issues],summary:releaseCandidateBudgetSummary(candidateAudit)},
  packageRuntime:packageEvidence??{passed:false,sourceRevision:revision(),archiveComment:'',requiredPathCount:9,okPathCount:0,httpFailures:1,processExitErrors:1,pathCoverage:0,commentMatch:false,issues:['package-evidence-missing']},
  packageRunCycle:packageRunCycleEvidence??{passed:false,sourceRevision:revision(),archiveComment:'',newRunOk:false,checkpointOk:false,resumeOk:false,elapsedDrift:999,endlessStateMatch:false,processExitErrors:1,commentMatch:false,issues:['package-run-cycle-evidence-missing']},
  archiveProvenance:provenanceEvidence??{passed:false,sourceRevision:revision(),archiveComment:'',criticalFileCount:6,matchingCriticalFiles:0,dirty:true,archiveErrors:1,criticalFileCoverage:0,issues:['provenance-evidence-missing']},
  archiveReproducibility:archiveEvidence??{passed:false,sourceRevision:revision(),firstSha256:'',secondSha256:'',firstEntryCount:0,secondEntryCount:0,trackedFileCount:0,firstComment:'',secondComment:'',missingTrackedFiles:0,unexpectedFiles:0,archiveErrors:1,hashMatch:false,entryCountMatch:false,commentMatch:false,issues:['archive-evidence-missing']},
});
console.log(manifest.markdown);
for(const [kind,result] of results)if(result.status!==0){const text=(result.stderr||result.stdout||'').trim();if(text)console.error(`[${kind}] ${text}`);}
const outIndex=process.argv.indexOf('--out');
const out=outIndex>=0?process.argv[outIndex+1]:null;
if(out){const target=path.resolve(out);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,`${JSON.stringify(manifest.json,null,2)}\n`,'utf8');}
process.exitCode=manifest.exitCode;
