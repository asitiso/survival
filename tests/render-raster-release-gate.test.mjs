import test from 'node:test';
import assert from 'node:assert/strict';
import { rasterReleaseQualityGate } from '../dist/game/render-raster-release-gate.js';

const passSummary={ok:true,status:'PASS',exitCode:0,lines:['PASS 16:9 A','PASS 20:9 B','PASS 4:3 C','PASS foldable D','PASS 32:9 E'],text:'ok'};

test('release gate passes only with clean raster summary, five profiles, and nine actions',()=>{
  const gate=rasterReleaseQualityGate({rasterSummary:passSummary,actionCount:9,requiredProfiles:5});
  assert.equal(gate.ok,true);assert.equal(gate.status,'PASS');assert.equal(gate.exitCode,0);
  assert.match(gate.markdown,/Action invariant \| 9\/9/);
});

test('release gate reviews raster regressions',()=>{
  const gate=rasterReleaseQualityGate({rasterSummary:{...passSummary,ok:false,status:'REVIEW',exitCode:2,lines:['REVIEW foldable A->B'],text:'review'},actionCount:9,requiredProfiles:5});
  assert.equal(gate.ok,false);assert.equal(gate.exitCode,2);assert.ok(gate.issues.some((x)=>x.includes('raster')));
});

test('release gate rejects action count drift and incomplete viewport coverage',()=>{
  const gate=rasterReleaseQualityGate({rasterSummary:{...passSummary,lines:passSummary.lines.slice(0,4)},actionCount:10,requiredProfiles:5});
  assert.equal(gate.ok,false);assert.ok(gate.issues.some((x)=>x.includes('action-count')));assert.ok(gate.issues.some((x)=>x.includes('profile-count')));
});

test('release summary signature and markdown are deterministic',()=>{
  const a=rasterReleaseQualityGate({rasterSummary:passSummary,actionCount:9,requiredProfiles:5});
  const b=rasterReleaseQualityGate({rasterSummary:passSummary,actionCount:9,requiredProfiles:5});
  assert.equal(a.signature,b.signature);assert.equal(a.markdown,b.markdown);assert.match(a.signature,/^RQ-[0-9A-F]{8}$/);
});

test('release gate report states baseline mutation is disabled',()=>{
  const gate=rasterReleaseQualityGate({rasterSummary:passSummary,actionCount:9,requiredProfiles:5});
  assert.match(gate.markdown,/Baseline mutation \| disabled/);
});
