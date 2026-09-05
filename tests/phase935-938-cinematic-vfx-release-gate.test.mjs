import test from 'node:test';
import assert from 'node:assert/strict';
import * as presentationRuntime from '../dist/game/presentation-runtime.js';
const { PresentationRuntime }=presentationRuntime;
import { auditVisualEffectsSafety } from '../dist/game/visual-effects-audit.js';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';

test('phase 935 screen-space glow is bounded by quality and reduced-flash-safe profile caps',()=>{
  assert.equal(typeof presentationRuntime.screenGlowProfile,'function');
  const glow=presentationRuntime.screenGlowProfile('ultimate','low',true);
  assert.ok(glow.alpha<=0.18&&glow.radius<=260);
  const runtime=new PresentationRuntime('low');
  for(let i=0;i<8;i++) runtime.emitScreenEffect({kind:'glow',x:800,y:450,radius:200,color:'#fff',ttl:.3,alpha:.6});
  assert.ok(runtime.screenEffectCount<=2);
  assert.ok(runtime.screenEffectSnapshot.every((e)=>e.alpha<=0.44));
});

test('phase 936-937 visual audit covers enemy ultimate boss lifecycle and destruction samples',()=>{
  const audit=auditVisualEffectsSafety();
  assert.ok(audit.enemySignatureSamples>=13);
  assert.equal(audit.ultimateChoreographySamples,6);
  assert.equal(audit.bossLifecycleSamples,12);
  assert.ok(audit.destructionSamples>=9);
  assert.equal(audit.cinematicVisualEffectsPassed,true);
  assert.equal(audit.passed,true);
});

test('phase 938 release freeze fail-closes on cinematic visual effects safety',()=>{
  const freeze=auditReleaseFreeze();
  assert.equal(freeze.cinematicVisualEffectsPassed,true);
  assert.ok(freeze.cinematicVisualEffectsSamples>=40);
  assert.equal(freeze.passed,true);
});
