import test from 'node:test';
import assert from 'node:assert/strict';
import {contourReleasePresentation} from '../dist/game/threat-impact-contour-release-rendering.js';
import {projectileFinalReadabilitySettlePresentation,safeLaneFinalReadabilitySettlePresentation} from '../dist/game/threat-impact-final-readability-settle-rendering.js';

test('secondary contours recover monotonically without changing canonical contour',()=>{
  const samples=[0,.25,.5,.75,1].map(reacquire=>contourReleasePresentation({reacquire,stress:.9,critical:false}));
  assert.ok(samples.every(x=>x.canonicalContourScale===1&&x.presentationOnly===true));
  for(let i=1;i<samples.length;i++) assert.ok(samples[i].secondaryContourScale>=samples[i-1].secondaryContourScale);
  assert.ok(samples[0].secondaryContourScale<samples.at(-1).secondaryContourScale);
  assert.equal(samples.at(-1).secondaryContourScale,1);
});

test('critical contour release is never weaker than normal release at equal state',()=>{
  const normal=contourReleasePresentation({reacquire:.3,stress:1,critical:false});
  const critical=contourReleasePresentation({reacquire:.3,stress:1,critical:true});
  assert.ok(critical.secondaryContourScale>=normal.secondaryContourScale);
});

test('final settle keeps primary floors while secondary contour releases gradually',()=>{
  const held=projectileFinalReadabilitySettlePresentation({primaryFloor:.2,reacquire:0,stress:1,critical:false});
  const mid=projectileFinalReadabilitySettlePresentation({primaryFloor:.2,reacquire:.5,stress:1,critical:false});
  const settled=projectileFinalReadabilitySettlePresentation({primaryFloor:.2,reacquire:1,stress:1,critical:false});
  assert.ok(held.primaryFloor>=.42&&mid.primaryFloor>=.42&&settled.primaryFloor>=.42);
  assert.ok(held.secondaryScale<mid.secondaryScale&&mid.secondaryScale<settled.secondaryScale);
});

test('safe-lane canonical floor remains protected during contour release',()=>{
  const lane=safeLaneFinalReadabilitySettlePresentation({primaryFloor:.2,reacquire:0,stress:1,critical:true,confidence:1});
  assert.ok(lane.primaryFloor>=.74);
  assert.equal(lane.presentationOnly,true);
});
