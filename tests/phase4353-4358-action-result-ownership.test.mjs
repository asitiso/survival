import test from 'node:test';
import assert from 'node:assert/strict';
import { actionResultPresentation, actionResultMinimumGap } from '../dist/game/action-result-readability.js';

const base={battlefieldStress:0,protectedWarning:false,safeLaneVisible:false,reducedMotion:false,reducedFlash:false};

test('Phase 4353-4358 resolved outcomes outrank ordinary contact without making normal hits dominant',()=>{
  const normal=actionResultPresentation({...base,kind:'normalHit'});
  const weak=actionResultPresentation({...base,kind:'weakpointHit'});
  const guard=actionResultPresentation({...base,kind:'guardBreak'});
  const weakBreak=actionResultPresentation({...base,kind:'weakpointBreak'});
  const stagger=actionResultPresentation({...base,kind:'bossStagger'});
  const kill=actionResultPresentation({...base,kind:'enemyKill'});
  assert.ok(normal.visible&&weak.visible&&guard.visible&&weakBreak.visible&&stagger.visible&&kill.visible);
  assert.ok(normal.priority<weak.priority);
  assert.ok(weak.priority<guard.priority);
  assert.ok(guard.priority<=weakBreak.priority);
  assert.ok(weakBreak.priority<=stagger.priority);
  assert.ok(stagger.priority<=kill.priority);
  assert.ok(normal.alpha<weak.alpha&&weak.alpha<weakBreak.alpha);
  assert.ok(normal.rayCount<=weak.rayCount&&weak.rayCount<weakBreak.rayCount);
});

test('repeated contact has a real coalescing gap while resolved breaks are effectively immediate',()=>{
  assert.ok(actionResultMinimumGap('normalHit')>=0.16);
  assert.ok(actionResultMinimumGap('weakpointHit')>=0.12);
  assert.ok(actionResultMinimumGap('weakpointHit')>actionResultMinimumGap('weakpointBreak'));
  assert.ok(actionResultMinimumGap('normalHit')>actionResultMinimumGap('guardBreak'));
  assert.ok(actionResultMinimumGap('bossStagger')<=0.03);
  assert.ok(actionResultMinimumGap('enemyKill')<=0.03);
});

test('source ownership is visually available only when an impact has meaningful separation',()=>{
  const near=actionResultPresentation({...base,kind:'weakpointHit',sourceDistance:10});
  const far=actionResultPresentation({...base,kind:'weakpointHit',sourceDistance:180});
  const breakCue=actionResultPresentation({...base,kind:'weakpointBreak',sourceDistance:220});
  assert.equal(near.connectorAlpha,0);
  assert.ok(far.connectorAlpha>0);
  assert.ok(breakCue.connectorAlpha>=far.connectorAlpha);
});
