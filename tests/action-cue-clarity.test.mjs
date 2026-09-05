import test from 'node:test';
import assert from 'node:assert/strict';
import * as hud from '../dist/game/hud-presentation.js';

test('phase 1463 gives assist the single animated outer-cue slot over an ultimate ready pulse',()=>{
  assert.equal(typeof hud.actionCuePresentation,'function');
  const result=hud.actionCuePresentation({assistActive:true,queued:false,readyPulseRequested:true,readyPulseActive:true,reducedFlash:false});
  assert.equal(result.outerCue,'assist');
  assert.equal(result.animated,true);
  assert.equal(result.clearReadyPulse,true);
  assert.equal(result.showAssistLabel,true);
});

test('phase 1471 compresses a queued assist to one steady ring and hides duplicate assist text',()=>{
  assert.equal(typeof hud.actionCuePresentation,'function');
  const result=hud.actionCuePresentation({assistActive:true,queued:true,readyPulseRequested:false,readyPulseActive:false,reducedFlash:false});
  assert.equal(result.outerCue,'assist');
  assert.equal(result.animated,false);
  assert.equal(result.showAssistLabel,false);
  assert.equal(result.motionAmplitude,0);
});

test('phase 1479 reduced flash keeps cue information but removes scale motion',()=>{
  assert.equal(typeof hud.actionCuePresentation,'function');
  const assist=hud.actionCuePresentation({assistActive:true,queued:false,readyPulseRequested:false,readyPulseActive:false,reducedFlash:true});
  const ready=hud.actionCuePresentation({assistActive:false,queued:false,readyPulseRequested:false,readyPulseActive:true,reducedFlash:true});
  assert.equal(assist.outerCue,'assist');
  assert.equal(assist.animated,false);
  assert.equal(assist.motionAmplitude,0);
  assert.equal(ready.outerCue,'ready');
  assert.equal(ready.animated,false);
  assert.equal(ready.motionAmplitude,0);
});

test('phase 1487 normal ready transition remains visible when no assist owns the slot',()=>{
  assert.equal(typeof hud.actionCuePresentation,'function');
  const result=hud.actionCuePresentation({assistActive:false,queued:false,readyPulseRequested:true,readyPulseActive:false,reducedFlash:false});
  assert.equal(result.outerCue,'ready');
  assert.equal(result.animated,true);
  assert.equal(result.clearReadyPulse,false);
});
