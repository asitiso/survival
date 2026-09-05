import test from 'node:test';
import assert from 'node:assert/strict';
import { renderContract } from '../dist/game/render-contract.js';
import { rasterizeRenderContract } from '../dist/game/render-raster-contract.js';
import { DEFAULT_RASTER_BASELINE_SPECS } from '../dist/game/render-raster-baseline.js';
import { approveRasterBaselineChange, defaultRasterBaselineReport, rasterBaselineChangeReport } from '../dist/game/render-raster-baseline-report.js';

function base(){return rasterizeRenderContract(renderContract(1600,900));}

test('exact raster baseline report is unchanged with zero changed cells',()=>{
  const raster=base();
  const report=rasterBaselineChangeReport('16:9',raster,raster,{minSimilarity:.985,minCriticalSimilarity:.995});
  assert.equal(report.status,'unchanged');
  assert.equal(report.changedCells,0);
  assert.equal(report.criticalChangedCells,0);
  assert.equal(report.similarity,1);
  assert.equal(report.criticalSimilarity,1);
});

test('critical layout drift produces review-required report and deterministic token',()=>{
  const contract=renderContract(1600,900);
  const shifted={...contract,frames:contract.frames.map((f)=>({...f,primitives:f.primitives.map((p)=>p.id==='hero-hud'&&p.kind==='rect'?{...p,x:p.x+140}:p)}))};
  const report=rasterBaselineChangeReport('16:9',rasterizeRenderContract(contract),rasterizeRenderContract(shifted),{minSimilarity:.985,minCriticalSimilarity:.995});
  assert.equal(report.status,'review-required');
  assert.ok(report.changedCells>0);
  assert.ok(report.criticalChangedCells>0);
  assert.ok(report.approvalToken.startsWith('RB-'));
  assert.deepEqual(report.approvalToken,rasterBaselineChangeReport('16:9',rasterizeRenderContract(contract),rasterizeRenderContract(shifted),{minSimilarity:.985,minCriticalSimilarity:.995}).approvalToken);
});

test('baseline approval rejects wrong token and accepts exact report token without rewriting files',()=>{
  const contract=renderContract(1600,900);
  const changed={...contract,frames:contract.frames.map((f)=>({...f,primitives:f.primitives.map((p)=>p.id==='status-hud'&&p.kind==='rect'?{...p,y:p.y+80}:p)}))};
  const report=rasterBaselineChangeReport('16:9',rasterizeRenderContract(contract),rasterizeRenderContract(changed));
  assert.equal(approveRasterBaselineChange(report,'RB-WRONG').approved,false);
  const approved=approveRasterBaselineChange(report,report.approvalToken);
  assert.equal(approved.approved,true);
  assert.equal(approved.id,'16:9');
  assert.equal(approved.signature,report.currentSignature);
});

test('default report covers and passes all five committed baseline signatures',()=>{
  const report=defaultRasterBaselineReport();
  assert.equal(report.ok,true,report.issues.join(','));
  assert.equal(report.entries.length,5);
  assert.deepEqual(report.entries.map((e)=>e.id),DEFAULT_RASTER_BASELINE_SPECS.map((e)=>e.id));
  assert.ok(report.entries.every((e)=>e.status==='unchanged'&&e.expectedSignature===e.currentSignature));
});
