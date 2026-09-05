import test from 'node:test';
import assert from 'node:assert/strict';
import { lastLawSafeTimeline } from '../dist/game/endless/last-law-safe-timeline.js';

const safe={label:'SAFE TIMELINE',safeTransitionMs:700,hazardActivationMs:500,decisionWindowMs:500,urgency:.72,stage:'move',autoMove:false};

test('non mythic or healthy mythic keeps safe timeline without law warning',()=>{
  const out=lastLawSafeTimeline(safe,false,.5,null);
  assert.equal(out.lawStage,'none');
  assert.equal(out.stage,'move');
  assert.equal(out.autoMove,false);
});

test('mythic boss approaching fifteen percent exposes pre-law warning',()=>{
  const out=lastLawSafeTimeline(safe,true,.19,null);
  assert.equal(out.lawStage,'warning');
  assert.match(out.label,/LAST LAW/);
  assert.ok(out.urgency>=safe.urgency);
});

test('active last law identity overrides warning and remains informational',()=>{
  const out=lastLawSafeTimeline(safe,true,.12,{active:true,label:'LAST LAW · BROKEN HOUR',accent:'#62caff'});
  assert.equal(out.lawStage,'active');
  assert.match(out.label,/BROKEN HOUR/);
  assert.equal(out.autoMove,false);
  assert.ok(out.urgency<=1);
});
