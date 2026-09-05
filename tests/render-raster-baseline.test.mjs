import test from 'node:test';
import assert from 'node:assert/strict';
import { renderContract } from '../dist/game/render-contract.js';
import { rasterizeRenderContract } from '../dist/game/render-raster-contract.js';
import { captureRasterBaseline, auditRasterBaseline, DEFAULT_RASTER_BASELINE_SPECS, auditDefaultRasterBaselines } from '../dist/game/render-raster-baseline.js';

test('captured raster baseline passes exact current contract',()=>{
  const raster=rasterizeRenderContract(renderContract(1600,900));
  const baseline=captureRasterBaseline('16:9',raster,{minSimilarity:.985,minCriticalSimilarity:.995});
  const audit=auditRasterBaseline(raster,baseline);
  assert.equal(audit.ok,true);
  assert.equal(audit.similarity,1);
  assert.equal(audit.criticalSimilarity,1);
});

test('small decorative drift can pass while critical HUD drift fails',()=>{
  const baseContract=renderContract(1600,900);
  const baseline=captureRasterBaseline('16:9',rasterizeRenderContract(baseContract),{minSimilarity:.97,minCriticalSimilarity:.995});
  const decorative={...baseContract,frames:baseContract.frames.map((f)=>({...f,primitives:f.primitives.map((p)=>p.id==='flow-aura'&&p.kind==='circle'?{...p,x:p.x+10}:p)}))};
  assert.equal(auditRasterBaseline(rasterizeRenderContract(decorative),baseline).ok,true);
  const critical={...baseContract,frames:baseContract.frames.map((f)=>({...f,primitives:f.primitives.map((p)=>p.id==='hero-hud'&&p.kind==='rect'?{...p,x:p.x+120}:p)}))};
  const audit=auditRasterBaseline(rasterizeRenderContract(critical),baseline);
  assert.equal(audit.ok,false);
  assert.ok(audit.issues.some((x)=>x.startsWith('critical-similarity')));
});

test('default baseline gate fixes five representative landscape signatures',()=>{
  assert.deepEqual(DEFAULT_RASTER_BASELINE_SPECS.map((x)=>x.id),['16:9','20:9','4:3','foldable','32:9']);
  assert.deepEqual(DEFAULT_RASTER_BASELINE_SPECS.map((x)=>x.signature),['RR-FE2C6B74','RR-0937F125','RR-4C84B218','RR-023FFC4B','RR-737044D6']);
  const audit=auditDefaultRasterBaselines();
  assert.equal(audit.ok,true,audit.issues.join(','));
  assert.equal(audit.entries.length,5);
});
