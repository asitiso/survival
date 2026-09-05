import test from 'node:test';
import assert from 'node:assert/strict';
import { PresentationRuntime } from '../dist/game/presentation-runtime.js';

test('phase 831-834 screen effects have a small quality-dependent budget independent from telegraphs',()=>{
  const high=new PresentationRuntime('high');
  const low=new PresentationRuntime('low');
  for(let i=0;i<12;i++){
    high.emitScreenEffect({kind:'shockwave',x:100,y:100,radius:80,color:'#fff',ttl:.3,alpha:.4});
    low.emitScreenEffect({kind:'shockwave',x:100,y:100,radius:80,color:'#fff',ttl:.3,alpha:.4});
  }
  assert.ok(high.screenEffectCount<=4);
  assert.ok(low.screenEffectCount<=2);
  assert.ok(high.screenEffectCount>low.screenEffectCount);
  for(let i=0;i<24;i++) assert.equal(low.emitTelegraph({x:i,y:0,radius:20,color:'#f00',ttl:1}),true);
  assert.equal(low.counts.telegraphs,24);
});

test('phase 835-836 screen flash alpha is clamped at the accessibility ceiling',()=>{
  const runtime=new PresentationRuntime('high');
  runtime.emitScreenEffect({kind:'flash',x:0,y:0,radius:0,color:'#fff',ttl:.2,alpha:1});
  assert.equal(runtime.screenEffectSnapshot[0].alpha,0.44);
});

test('phase 837-838 screen effects expire without historical growth',()=>{
  const runtime=new PresentationRuntime('high');
  runtime.emitScreenEffect({kind:'pulse',x:20,y:30,radius:50,color:'#fff',ttl:.1,alpha:.2});
  runtime.update(.2);
  assert.equal(runtime.screenEffectCount,0);
});
