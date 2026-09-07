import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  projectileFinalReadabilitySettlePresentation,
  impactFinalReadabilitySettlePresentation,
  hazardFinalReadabilitySettlePresentation,
  safeLaneFinalReadabilitySettlePresentation,
} from '../dist/game/threat-impact-final-readability-settle-rendering.js';

const src=(path)=>fs.readFileSync(new URL(`../src/game/${path}`,import.meta.url),'utf8');

test('secondary color recovery is monotonic with reacquisition',()=>{
  const early=impactFinalReadabilitySettlePresentation({primaryFloor:.3,reacquire:.1,stress:.9,critical:false});
  const mid=impactFinalReadabilitySettlePresentation({primaryFloor:.3,reacquire:.5,stress:.9,critical:false});
  const late=impactFinalReadabilitySettlePresentation({primaryFloor:.3,reacquire:.95,stress:.9,critical:false});
  assert.ok(early.valueScale<mid.valueScale&&mid.valueScale<late.valueScale);
  assert.ok(early.chromaScale<mid.chromaScale&&mid.chromaScale<late.chromaScale);
  assert.ok(late.valueScale<=1&&late.chromaScale<=1);
});

test('critical color recovery never falls below normal at the same state',()=>{
  const normal=projectileFinalReadabilitySettlePresentation({primaryFloor:.4,reacquire:.35,stress:.8,critical:false});
  const critical=projectileFinalReadabilitySettlePresentation({primaryFloor:.4,reacquire:.35,stress:.8,critical:true});
  assert.ok(critical.valueScale>=normal.valueScale);
  assert.ok(critical.chromaScale>=normal.chromaScale);
});

test('safe lane color remains canonical through recovery',()=>{
  const lane=safeLaneFinalReadabilitySettlePresentation({primaryFloor:.6,reacquire:.05,stress:1,critical:true,confidence:1});
  assert.equal(lane.valueScale,1);
  assert.equal(lane.chromaScale,1);
});

test('live color filters consume recovery scale while protected telegraph still bypasses filtering',()=>{
  const enemies=src('enemies.ts'),spells=src('spells.ts'),game=src('game.ts');
  assert.match(enemies,/projectileFinalSettle\.valueScale/);
  assert.match(enemies,/projectileFinalSettle\.chromaScale/);
  assert.match(spells,/impactFinalSettle\.valueScale/);
  assert.match(spells,/impactFinalSettle\.chromaScale/);
  assert.match(game,/hazardFinalSettle\.valueScale/);
  assert.match(game,/hazard\.telegraph>0\?'none'/);
});
