import test from 'node:test';
import assert from 'node:assert/strict';
import { renderContract } from '../dist/game/render-contract.js';
import { rasterizeRenderContract, rasterContractSignature, rasterSimilarity } from '../dist/game/render-raster-contract.js';

test('raster contract is deterministic for the same logical render contract',()=>{
  const c=renderContract(1600,900);
  const a=rasterizeRenderContract(c),b=rasterizeRenderContract(c);
  assert.deepEqual(a,b);
  assert.equal(rasterContractSignature(a),rasterContractSignature(b));
  assert.equal(rasterSimilarity(a,b),1);
});

test('large geometry drift lowers raster similarity',()=>{
  const c=renderContract(1600,900);
  const shifted={...c,frames:c.frames.map((f,i)=>i?f:{...f,primitives:f.primitives.map((p)=>p.id==='hero-hud'?{...p,x:p.x+320}:p)})};
  const similarity=rasterSimilarity(rasterizeRenderContract(c),rasterizeRenderContract(shifted));
  assert.ok(similarity<.98);
  assert.ok(similarity>.5);
});

test('missing critical primitive is visible to raster similarity',()=>{
  const c=renderContract(2208,1840);
  const missing={...c,frames:c.frames.map((f)=>({...f,primitives:f.primitives.filter((p)=>p.id!=='status-hud')}))};
  assert.ok(rasterSimilarity(rasterizeRenderContract(c),rasterizeRenderContract(missing))<.995);
});
