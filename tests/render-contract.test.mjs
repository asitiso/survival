import test from 'node:test';
import assert from 'node:assert/strict';
import { renderContract, renderContractSignature, auditRenderContract } from '../dist/game/render-contract.js';

const viewports=[[1600,900],[2400,1080],[1200,900],[2208,1840],[3840,1080]];

test('render contract is deterministic across representative landscape viewport classes',()=>{
  for(const [w,h] of viewports){
    const a=renderContract(w,h),b=renderContract(w,h);
    assert.deepEqual(a,b);
    assert.equal(renderContractSignature(a),renderContractSignature(b));
    assert.equal(a.actionCount,9);
    assert.deepEqual(a.frames.map((f)=>f.id),['opening','boss','mythic','final-flow','long-run']);
  }
});

test('render contract audit rejects no representative layout and preserves hinge exclusion',()=>{
  for(const [w,h] of viewports){
    const contract=renderContract(w,h),audit=auditRenderContract(contract);
    assert.equal(audit.ok,true,`${w}x${h}: ${audit.issues.join(', ')}`);
  }
  const foldable=renderContract(2208,1840);
  assert.equal(foldable.safeArea.aspectClass,'foldable');
  assert.ok(foldable.safeArea.hingeExclusion);
  const hinge=foldable.safeArea.hingeExclusion;
  for(const frame of foldable.frames){
    for(const primitive of frame.primitives.filter((p)=>p.role==='interactive'||p.role==='critical-hud')){
      if(primitive.kind==='circle')assert.ok(primitive.x+primitive.radius<=hinge.x||primitive.x-primitive.radius>=hinge.x+hinge.width);
      if(primitive.kind==='rect')assert.ok(primitive.x+primitive.width<=hinge.x||primitive.x>=hinge.x+hinge.width);
    }
  }
});

test('contract audit detects action loss and out-of-bounds critical primitives',()=>{
  const contract=renderContract(1600,900);
  const broken={...contract,actionCount:8,frames:contract.frames.map((frame,i)=>i?frame:{...frame,primitives:[...frame.primitives,{kind:'rect',role:'critical-hud',id:'broken',x:-20,y:0,width:10,height:10}]})};
  const audit=auditRenderContract(broken);
  assert.equal(audit.ok,false);
  assert.ok(audit.issues.some((x)=>x.includes('action-count')));
  assert.ok(audit.issues.some((x)=>x.includes('out-of-bounds')));
});
