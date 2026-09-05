import test from 'node:test';
import assert from 'node:assert/strict';
import { hitTestActionButton, applyJoystickDeadzone } from '../dist/core/touch-controls.js';
import { mobileFrameGovernorPolicy } from '../dist/game/endless/mobile-frame-governor.js';
import { PresentationRuntime } from '../dist/game/presentation-runtime.js';

test('overlapping mobile action hit areas select the closest normalized target instead of array order',()=>{
  const buttons=[
    {id:'spell1',x:100,y:100,radius:60,label:'A',key:'1'},
    {id:'spell2',x:150,y:100,radius:60,label:'B',key:'2'},
  ];
  assert.equal(hitTestActionButton({x:142,y:100},buttons,1.3)?.id,'spell2');
  assert.equal(hitTestActionButton({x:108,y:100},buttons,1.3)?.id,'spell1');
  assert.equal(hitTestActionButton({x:400,y:400},buttons,1.3),null);
});

test('joystick deadzone removes thumb drift and remaps remaining travel continuously',()=>{
  assert.deepEqual(applyJoystickDeadzone({x:.05,y:.02}),{x:0,y:0});
  const mid=applyJoystickDeadzone({x:.5,y:0});
  assert.ok(mid.x>0 && mid.x<.5); assert.equal(mid.y,0);
  const max=applyJoystickDeadzone({x:1,y:0});
  assert.ok(Math.abs(max.x-1)<1e-9);
});

test('mobile frame tiers immediately lower decorative entity budgets but preserve telegraph capacity',()=>{
  const full=mobileFrameGovernorPolicy('full'), reduced=mobileFrameGovernorPolicy('reduced'), minimal=mobileFrameGovernorPolicy('minimal');
  assert.ok(full.particleCap>reduced.particleCap && reduced.particleCap>minimal.particleCap);
  assert.ok(full.trailCap>reduced.trailCap && reduced.trailCap>minimal.trailCap);
  assert.equal(full.telegraphCap,reduced.telegraphCap); assert.equal(reduced.telegraphCap,minimal.telegraphCap);
  assert.equal(minimal.telegraphCap,24);
});

test('presentation runtime can shed existing decorative load immediately without deleting danger telegraphs',()=>{
  const runtime=new PresentationRuntime('high');
  for(let i=0;i<100;i+=1) runtime.emitParticle({x:i,y:0,color:'#fff',ttl:2});
  for(let i=0;i<50;i+=1) runtime.emitTrail({x1:0,y1:0,x2:i,y2:0,color:'#fff',ttl:2});
  for(let i=0;i<20;i+=1) runtime.emitTelegraph({x:i,y:0,radius:10,color:'#f00',ttl:2});
  runtime.trimToBudget(40,20,24);
  assert.deepEqual(runtime.counts,{particles:40,trails:20,telegraphs:20});
});
