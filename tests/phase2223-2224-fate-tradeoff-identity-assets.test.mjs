import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const benefitUrl=new URL('../dist/game/fate-benefit-vector-identity-assets.js',import.meta.url);
const costUrl=new URL('../dist/game/fate-cost-vector-identity-assets.js',import.meta.url);

test('phase 2223 provides four static fate benefit vector identities',async()=>{
  assert.equal(fs.existsSync(benefitUrl),true,'benefit vector module must exist');
  const m=await import(benefitUrl.href);
  assert.deepEqual(m.FATE_BENEFIT_VECTOR_IDS,['xp-growth','gold-shop','core-guard','objective-reward']);
  assert.deepEqual(m.FATE_BENEFIT_VECTOR_ATLAS,{src:'./assets/ui/fate-benefit-vector-icons.png',columns:4,rows:1,cellSize:96,width:384,height:96});
  for(const id of m.FATE_BENEFIT_VECTOR_IDS){const icon=m.fateBenefitVectorIcon(id);assert.equal(icon.animated,false);assert.equal(icon.motionAmplitude,0);assert.equal(icon.textFallbackPreserved,true);assert.equal(icon.loadFailureBlocksGameplay,false);}
  const a=m.auditFateBenefitVectorAtlas();assert.equal(a.coverage,1);assert.equal(a.uniqueCellCount,4);assert.deepEqual(a.outOfBounds,[]);assert.equal(a.passed,true);
});

test('phase 2224 provides five static fate cost vector identities',async()=>{
  assert.equal(fs.existsSync(costUrl),true,'cost vector module must exist');
  const m=await import(costUrl.href);
  assert.deepEqual(m.FATE_COST_VECTOR_IDS,['horde-pressure','elite-frequency','enemy-speed','boss-variant','growth-tax']);
  assert.deepEqual(m.FATE_COST_VECTOR_ATLAS,{src:'./assets/ui/fate-cost-vector-icons.png',columns:5,rows:1,cellSize:96,width:480,height:96});
  for(const id of m.FATE_COST_VECTOR_IDS){const icon=m.fateCostVectorIcon(id);assert.equal(icon.animated,false);assert.equal(icon.motionAmplitude,0);assert.equal(icon.textFallbackPreserved,true);assert.equal(icon.loadFailureBlocksGameplay,false);}
  const a=m.auditFateCostVectorAtlas();assert.equal(a.coverage,1);assert.equal(a.uniqueCellCount,5);assert.deepEqual(a.outOfBounds,[]);assert.equal(a.passed,true);
});
