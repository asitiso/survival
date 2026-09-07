import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceFreezeStatusLifecycle, createFreezeStatusLifecycleState, freezeStatusEdgePresentation } from '../dist/game/freeze-status-readability.js';

test('Phase 4419-4424 freeze lifecycle eases strength changes and does not jump on reapplication',()=>{
  let state=createFreezeStatusLifecycleState();
  state=advanceFreezeStatusLifecycle(state,{active:true,targetAlpha:.72,targetSizeScale:1},.1,false);
  const first=state;
  state=advanceFreezeStatusLifecycle(state,{active:true,targetAlpha:.18,targetSizeScale:.76},.1,false);
  const fading=state;
  state=advanceFreezeStatusLifecycle(state,{active:true,targetAlpha:.72,targetSizeScale:1},.016,false);
  assert.ok(first.alpha>0);
  assert.ok(fading.alpha<first.alpha);
  assert.ok(state.alpha-fading.alpha<.08,'reapplication must ease upward instead of snapping to full alpha');
});

test('Phase 4419-4424 release keeps a short visible tail then retires cleanly',()=>{
  let state=createFreezeStatusLifecycleState();
  for(let i=0;i<5;i++)state=advanceFreezeStatusLifecycle(state,{active:true,targetAlpha:.7,targetSizeScale:1},.08,false);
  const activeAlpha=state.alpha;
  state=advanceFreezeStatusLifecycle(state,{active:false,targetAlpha:0,targetSizeScale:.72},.05,false);
  assert.equal(state.visible,true);
  assert.ok(state.alpha>0&&state.alpha<activeAlpha);
  for(let i=0;i<20;i++)state=advanceFreezeStatusLifecycle(state,{active:false,targetAlpha:0,targetSizeScale:.72},.08,false);
  assert.equal(state.visible,false);
  assert.equal(state.alpha,0);
});

test('Phase 4419-4424 Reduced Motion removes lifecycle pulse without freezing alpha cleanup',()=>{
  let state=createFreezeStatusLifecycleState();
  state=advanceFreezeStatusLifecycle(state,{active:true,targetAlpha:.7,targetSizeScale:1},.1,true);
  assert.equal(state.pulseScale,0);
  const before=state.alpha;
  state=advanceFreezeStatusLifecycle(state,{active:false,targetAlpha:0,targetSizeScale:.72},.1,true);
  assert.ok(state.alpha<before);
});

test('Phase 4419-4424 edge presentation scales oversized freeze cues inward without moving enemy ownership',()=>{
  const center=freezeStatusEdgePresentation({x:800,y:450,size:140,viewportWidth:1600,viewportHeight:900});
  const edge=freezeStatusEdgePresentation({x:30,y:40,size:140,viewportWidth:1600,viewportHeight:900});
  assert.equal(center.sizeScale,1);
  assert.ok(edge.sizeScale<1);
  assert.ok(edge.sizeScale>=.55);
  assert.equal(edge.offsetX,0);
  assert.equal(edge.offsetY,0);
});

test('Phase 4419-4424 hero x threat x control lifecycle matrix stays finite',()=>{
  const heroes=['arkan','seria','kain','edric'];
  const controls=['manual','auto'];
  let cases=0;
  for(const hero of heroes)for(let threat=0;threat<=5;threat++)for(const control of controls){
    let state=createFreezeStatusLifecycleState();
    const reducedMotion=control==='manual'&&hero==='seria';
    state=advanceFreezeStatusLifecycle(state,{active:true,targetAlpha:.35+threat*.06,targetSizeScale:.82+threat*.03},.016,reducedMotion);
    const edge=freezeStatusEdgePresentation({x:threat%2?1580:20,y:hero==='edric'?880:40,size:80+threat*12,viewportWidth:1600,viewportHeight:900});
    assert.ok(Number.isFinite(state.alpha)&&Number.isFinite(state.sizeScale));
    assert.ok(Number.isFinite(edge.sizeScale));
    assert.ok(state.alpha>=0&&state.alpha<=1);
    cases++;
  }
  assert.equal(cases,48);
});
