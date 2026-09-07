import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  hazardFinalReadabilitySettlePresentation,
  impactFinalReadabilitySettlePresentation,
  projectileFinalReadabilitySettlePresentation,
  safeLaneFinalReadabilitySettlePresentation,
} from '../dist/game/threat-impact-final-readability-settle-rendering.js';

const src=(path)=>fs.readFileSync(new URL(`../src/game/${path}`,import.meta.url),'utf8');

test('secondary dash spacing recovers monotonically toward canonical cadence',()=>{
  const early=impactFinalReadabilitySettlePresentation({primaryFloor:.3,reacquire:.1,stress:.9,critical:false});
  const mid=impactFinalReadabilitySettlePresentation({primaryFloor:.3,reacquire:.5,stress:.9,critical:false});
  const late=impactFinalReadabilitySettlePresentation({primaryFloor:.3,reacquire:.95,stress:.9,critical:false});
  assert.ok(early.dashGapScale>mid.dashGapScale&&mid.dashGapScale>late.dashGapScale);
  assert.ok(late.dashGapScale>=1);
});

test('critical dash recovery is never more demoted than normal at the same state',()=>{
  const normal=projectileFinalReadabilitySettlePresentation({primaryFloor:.4,reacquire:.35,stress:.8,critical:false});
  const critical=projectileFinalReadabilitySettlePresentation({primaryFloor:.4,reacquire:.35,stress:.8,critical:true});
  assert.ok(critical.dashGapScale<=normal.dashGapScale);
});

test('safe lane keeps canonical dash cadence through recovery',()=>{
  const lane=safeLaneFinalReadabilitySettlePresentation({primaryFloor:.6,reacquire:.05,stress:1,critical:true,confidence:1},true,true);
  assert.equal(lane.dashGapScale,1);
});

test('live forecast and hazard residue use reacquisition-aware dash recovery',()=>{
  const game=src('game.ts');
  assert.match(game,/safeLaneFinalSettle\.settle/);
  assert.match(game,/hazardFinalSettle\.dashGapScale/);
});
