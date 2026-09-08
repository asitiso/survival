import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  projectileFinalReadabilitySettlePresentation,
  impactFinalReadabilitySettlePresentation,
  safeLaneFinalReadabilitySettlePresentation,
} from '../dist/game/threat-impact-final-readability-settle-rendering.js';

const src=(path)=>fs.readFileSync(new URL(`../src/game/${path}`,import.meta.url),'utf8');

test('secondary glow recovery is monotonic with reacquisition',()=>{
  const early=impactFinalReadabilitySettlePresentation({primaryFloor:.3,reacquire:.1,stress:.9,critical:false});
  const mid=impactFinalReadabilitySettlePresentation({primaryFloor:.3,reacquire:.5,stress:.9,critical:false});
  const late=impactFinalReadabilitySettlePresentation({primaryFloor:.3,reacquire:.95,stress:.9,critical:false});
  assert.ok(early.glowBlurScale<mid.glowBlurScale&&mid.glowBlurScale<late.glowBlurScale);
  assert.ok(late.glowBlurScale<=1);
});

test('critical glow recovery never falls below normal at the same state',()=>{
  const normal=projectileFinalReadabilitySettlePresentation({primaryFloor:.4,reacquire:.35,stress:.8,critical:false});
  const critical=projectileFinalReadabilitySettlePresentation({primaryFloor:.4,reacquire:.35,stress:.8,critical:true});
  assert.ok(critical.glowBlurScale>=normal.glowBlurScale);
});

test('safe lane keeps canonical glow ownership through recovery',()=>{
  const lane=safeLaneFinalReadabilitySettlePresentation({primaryFloor:.6,reacquire:.05,stress:1,critical:true,confidence:1},false,true);
  assert.equal(lane.glowBlurScale,1);
});

test('reduced flash further limits normal secondary glow recovery without weakening protected critical glow',()=>{
  const normal=projectileFinalReadabilitySettlePresentation({primaryFloor:.4,reacquire:.5,stress:.8,critical:false},false,false);
  const reduced=projectileFinalReadabilitySettlePresentation({primaryFloor:.4,reacquire:.5,stress:.8,critical:false},false,true);
  const critical=projectileFinalReadabilitySettlePresentation({primaryFloor:.4,reacquire:.5,stress:.8,critical:true},false,true);
  assert.ok(reduced.glowBlurScale<normal.glowBlurScale);
  assert.ok(critical.glowBlurScale>=reduced.glowBlurScale);
});

test('live enemy projectile glow consumes final recovery scale',()=>{
  const enemies=src('enemies.ts');
  assert.match(enemies,/projectileFinalSettle\.glowBlurScale/);
});
