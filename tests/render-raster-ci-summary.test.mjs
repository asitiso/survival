import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { rasterCiDiffSummary, defaultRasterCiDiffSummary } from '../dist/game/render-raster-ci-summary.js';
import { renderContract } from '../dist/game/render-contract.js';
import { rasterizeRenderContract } from '../dist/game/render-raster-contract.js';
import { rasterBaselineChangeReport } from '../dist/game/render-raster-baseline-report.js';

test('default raster CI summary reports five clean PASS viewports',()=>{
  const s=defaultRasterCiDiffSummary();
  assert.equal(s.ok,true);
  assert.equal(s.status,'PASS');
  assert.equal(s.exitCode,0);
  assert.equal(s.lines.length,5);
  assert.ok(s.lines.every((line)=>line.startsWith('PASS ')));
});

test('changed raster report becomes REVIEW and includes similarity critical cells and approval token',()=>{
  const base=rasterizeRenderContract(renderContract(1600,900));
  const current=structuredClone(base);
  current.frames[0].cells[0]=5;
  const report=rasterBaselineChangeReport('16:9',base,current,{minSimilarity:.99999,minCriticalSimilarity:.99999});
  const s=rasterCiDiffSummary([report]);
  assert.equal(s.ok,false);
  assert.equal(s.status,'REVIEW');
  assert.equal(s.exitCode,2);
  assert.match(s.text,/REVIEW 16:9/);
  assert.match(s.text,/critical=/);
  assert.ok(s.text.includes(report.approvalToken));
});

test('CI summary is deterministic and never mutates the supplied report',()=>{
  const base=rasterizeRenderContract(renderContract(1200,900));
  const current=structuredClone(base);current.frames[1].cells[30]=4;
  const report=rasterBaselineChangeReport('4:3',base,current);
  const before=JSON.stringify(report);
  assert.equal(rasterCiDiffSummary([report]).text,rasterCiDiffSummary([report]).text);
  assert.equal(JSON.stringify(report),before);
});

test('summary output contains a human-readable header and explicit no-auto-approval footer',()=>{
  const s=defaultRasterCiDiffSummary();
  assert.match(s.text,/Raster Baseline CI/);
  assert.match(s.text,/baseline auto-update: disabled/);
});

test('repository exposes a CI-friendly raster verification script without baseline writes',()=>{
  const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));
  const script=fs.readFileSync(new URL('../scripts/render-raster-ci.mjs',import.meta.url),'utf8');
  assert.ok(pkg.scripts['verify:raster']);
  assert.ok(script.includes('defaultRasterCiDiffSummary'));
  assert.ok(!script.includes('writeFile'));
});
