import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));
const scriptUrl=new URL('../scripts/release-manifest.mjs',import.meta.url);

test('repository exposes one release manifest command that composes test build raster and release gates',()=>{
  assert.equal(pkg.scripts['verify:manifest'],'node scripts/release-manifest.mjs');
  const source=fs.readFileSync(scriptUrl,'utf8');
  assert.match(source,/releaseVerificationPlan/);
  const planSource=fs.readFileSync(new URL('../scripts/release-verification-plan.mjs',import.meta.url),'utf8');
  assert.match(planSource,/kind:'build'/);
  assert.match(planSource,/verify-tests-parallel\.mjs/);
  assert.match(planSource,/render-raster-ci\.mjs/);
  assert.match(planSource,/render-release-gate\.mjs/);
  assert.match(source,/foldableThumbTravelAudit/);
  assert.match(source,/releaseManifest/);
});

test('release manifest CLI may write an explicit JSON artifact but never rewrites raster baselines',()=>{
  const source=fs.readFileSync(scriptUrl,'utf8');
  assert.match(source,/--out/);
  assert.doesNotMatch(source,/render-raster-baseline\.ts/);
  assert.doesNotMatch(source,/baseline.*write/i);
});
