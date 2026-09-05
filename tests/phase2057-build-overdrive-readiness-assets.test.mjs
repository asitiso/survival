import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildOverdriveRecallPresentation,
  buildOverdriveReadinessSegments,
} from '../dist/game/build-overdrive-recall-assets.js';

test('phase 2057 derives a static four-segment overdrive readiness presentation without gameplay ownership',()=>{
  assert.equal(buildOverdriveReadinessSegments(0),0);
  assert.equal(buildOverdriveReadinessSegments(24.999),0);
  assert.equal(buildOverdriveReadinessSegments(25),1);
  assert.equal(buildOverdriveReadinessSegments(50),2);
  assert.equal(buildOverdriveReadinessSegments(75),3);
  assert.equal(buildOverdriveReadinessSegments(100),4);
  const charging=buildOverdriveRecallPresentation({charge:77,activeUntilMs:0,activations:2},50_000,false);
  assert.deepEqual(charging,{mode:'charging',charge:77,filledSegments:3,totalSegments:4,remainingSeconds:0,numericLabel:'77',compact:false,animated:false,motionAmplitude:0,textFallbackPreserved:true,loadFailureBlocksGameplay:false});
  const active=buildOverdriveRecallPresentation({charge:0,activeUntilMs:62_000,activations:3},50_000,false);
  assert.equal(active.mode,'active'); assert.equal(active.remainingSeconds,12); assert.equal(active.numericLabel,'OD 12s'); assert.equal(active.filledSegments,0);
  const compact=buildOverdriveRecallPresentation({charge:88,activeUntilMs:0,activations:2},50_000,true);
  assert.equal(compact.compact,true); assert.equal(compact.numericLabel,''); assert.equal(compact.filledSegments,3);
});
