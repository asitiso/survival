import test from 'node:test';
import assert from 'node:assert/strict';
import { openingHudFocusPolicy } from '../dist/game/opening-hud-focus.js';

test('phase 455 first two minutes keep only one build label and two tactical rows so new players read combat first',()=>{
  const p=openingHudFocusPolicy(90);
  assert.equal(p.maxBuildLabels,1); assert.equal(p.maxTacticalRows,2);
});

test('phase 456 two to five minutes gradually opens one more build label without hiding critical bars',()=>{
  const p=openingHudFocusPolicy(180);
  assert.equal(p.maxBuildLabels,2); assert.equal(p.keepCriticalBars,true);
});

test('phase 457 five to ten minutes allows normal tactical context but still prevents early information flooding',()=>{
  const p=openingHudFocusPolicy(480);
  assert.equal(p.maxBuildLabels,3); assert.equal(p.maxTacticalRows,3);
});

test('phase 458 after ten minutes the policy becomes neutral and costs no permanent hud complexity',()=>{
  const p=openingHudFocusPolicy(601);
  assert.equal(p.maxBuildLabels,4); assert.equal(p.maxTacticalRows,4); assert.equal(p.active,false);
});
