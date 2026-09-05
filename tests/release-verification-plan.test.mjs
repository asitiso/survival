import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { releaseVerificationPlan } from '../scripts/release-verification-plan.mjs';

test('phase 519 manifest verification plan builds exactly once',()=>{
  const plan=releaseVerificationPlan(); assert.equal(plan.filter((s)=>s.kind==='build').length,1);
});
test('phase 520 post-build checks execute direct node entrypoints instead of nested npm build wrappers',()=>{
  const plan=releaseVerificationPlan();
  assert.ok(plan.slice(1).every((s)=>s.command==='node'));
  assert.ok(plan.some((s)=>s.kind==='tests'&&s.command==='node'&&s.args.includes('scripts/verify-tests-parallel.mjs')));
});
test('phase 521 manifest runner source uses the shared verification plan and no duplicate verify npm commands',()=>{
  const source=fs.readFileSync(new URL('../scripts/release-manifest.mjs',import.meta.url),'utf8');
  assert.match(source,/releaseVerificationPlan/);
  assert.doesNotMatch(source,/npm.*verify:raster/);
  assert.doesNotMatch(source,/npm.*verify:release/);
  assert.doesNotMatch(source,/npm.*verify:candidate/);
});
test('phase 522 verification plan keeps tests raster release and candidate as mandatory evidence',()=>{
  const kinds=releaseVerificationPlan().map((s)=>s.kind);
  assert.deepEqual(kinds,['build','tests','raster','release','candidate','archive','provenance','package','runCycle']);
});
