import test from 'node:test';
import assert from 'node:assert/strict';
import { flowImpactProfile } from '../dist/game/endless/final-form-flow-feedback.js';
import { soundDescriptor } from '../dist/game/audio.js';
import { PresentationRuntime } from '../dist/game/presentation-runtime.js';

test('flow impact only exists at meaningful 2/4/5 streak crossings and remains bounded',()=>{
  assert.equal(flowImpactProfile(2,3,'flow','full'),null);
  const two=flowImpactProfile(1,2,'flow','full');
  const five=flowImpactProfile(4,5,'surge','full');
  assert.ok(two&&five);
  assert.ok(five.freezeMs>two.freezeMs);
  assert.ok(five.freezeMs<=55);
  assert.ok(five.shake<=4);
  assert.ok(five.particleCount<=12);
});

test('minimal quality keeps readable hitstop/audio while reducing decoration',()=>{
  const full=flowImpactProfile(3,4,'drift','full');
  const minimal=flowImpactProfile(3,4,'drift','minimal');
  assert.ok(full&&minimal);
  assert.equal(minimal.freezeMs,full.freezeMs);
  assert.ok(minimal.particleCount<full.particleCount);
  assert.ok(soundDescriptor('flowImpact').priority>=3);
});

test('presentation pseudo-hitstop slows decoration but never freezes danger telegraphs',()=>{
  const runtime=new PresentationRuntime('high');
  runtime.emitParticle({x:0,y:0,color:'#fff',ttl:1});
  runtime.emitTelegraph({x:0,y:0,radius:10,color:'#f00',ttl:1});
  runtime.update(.05,.1);
  assert.ok(runtime.particleSnapshot[0].ttl>.99-0.001);
  assert.ok(runtime.telegraphSnapshot[0].ttl<=.951);
});
