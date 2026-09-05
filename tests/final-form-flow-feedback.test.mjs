import test from 'node:test';
import assert from 'node:assert/strict';
import { flowFeedbackProfile, shouldEmitFlowCue } from '../dist/game/endless/final-form-flow-feedback.js';

test('flow feedback grows at readable thresholds without creating unbounded visual density',()=>{
  const low=flowFeedbackProfile(1,'flow','full');
  const high=flowFeedbackProfile(5,'flow','full');
  assert.ok(high.auraAlpha>low.auraAlpha);
  assert.ok(high.trailSegments>low.trailSegments);
  assert.ok(high.trailSegments<=10);
  assert.ok(high.pulseRadius<=64);
});

test('reduced/minimal presentation lowers decoration but preserves a visible aura',()=>{
  const full=flowFeedbackProfile(5,'surge','full');
  const minimal=flowFeedbackProfile(5,'surge','minimal');
  assert.ok(minimal.trailSegments<full.trailSegments);
  assert.ok(minimal.auraAlpha>=0.18);
});

test('flow cues only fire when crossing meaningful streak thresholds',()=>{
  assert.equal(shouldEmitFlowCue(1,2),true);
  assert.equal(shouldEmitFlowCue(2,3),false);
  assert.equal(shouldEmitFlowCue(2,4),true);
  assert.equal(shouldEmitFlowCue(4,5),true);
});
