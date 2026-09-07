import test from 'node:test';
import assert from 'node:assert/strict';
import { freezeStatusPresentation } from '../dist/game/freeze-status-readability.js';

test('Phase 4407-4412 strong, medium, and fading slow states have ordered visual emphasis',()=>{
  const strong=freezeStatusPresentation({slowFactor:.42,slowTimer:1.4,enemyClass:'regular'});
  const medium=freezeStatusPresentation({slowFactor:.76,slowTimer:1.4,enemyClass:'regular'});
  const fading=freezeStatusPresentation({slowFactor:.42,slowTimer:.18,enemyClass:'regular'});
  assert.equal(strong.band,'strong');
  assert.equal(medium.band,'medium');
  assert.equal(fading.band,'fading');
  assert.ok(strong.alpha>medium.alpha);
  assert.ok(medium.alpha>fading.alpha);
  assert.ok(strong.sizeScale>medium.sizeScale);
  assert.ok(fading.sizeScale<medium.sizeScale);
});

test('Phase 4407-4412 inactive slow state hides the cue and does not mutate combat inputs',()=>{
  const input={slowFactor:1,slowTimer:0,enemyClass:'elite'};
  const before={...input};
  const cue=freezeStatusPresentation(input);
  assert.equal(cue.visible,false);
  assert.deepEqual(input,before);
});

test('Phase 4407-4412 class identity changes base size without changing slow severity classification',()=>{
  const regular=freezeStatusPresentation({slowFactor:.5,slowTimer:1,enemyClass:'regular'});
  const boss=freezeStatusPresentation({slowFactor:.5,slowTimer:1,enemyClass:'boss'});
  assert.equal(regular.band,'strong');
  assert.equal(boss.band,'strong');
  assert.ok(boss.baseSize>regular.baseSize);
  assert.equal(boss.alpha,regular.alpha);
});

test('Phase 4407-4412 Reduced Flash lowers active freeze intensity without hiding the status',()=>{
  const normal=freezeStatusPresentation({slowFactor:.5,slowTimer:1,enemyClass:'specialist'});
  const reduced=freezeStatusPresentation({slowFactor:.5,slowTimer:1,enemyClass:'specialist',reducedFlash:true});
  assert.equal(reduced.visible,true);
  assert.ok(reduced.alpha<normal.alpha);
  assert.ok(reduced.alpha>0);
});
