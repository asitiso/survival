import test from 'node:test';
import assert from 'node:assert/strict';
import { longRunHudFocusPolicy } from '../dist/game/long-run-hud-focus.js';
import { ACTION_BUTTONS } from '../dist/game/config.js';

test('phase 439 long-run HUD focus leaves the normal first two hours unchanged',()=>{
  const p=longRunHudFocusPolicy(7199,false,false);
  assert.equal(p.tier,0);
  assert.equal(p.showXpNumbers,true);
  assert.equal(p.showMeterText,true);
  assert.equal(p.maxBuildLabels,4);
  assert.equal(p.statusMaxChars,64);
});

test('phase 440 optional HUD text reduces progressively at two four and eight hours',()=>{
  const p2=longRunHudFocusPolicy(2*3600,false,false);
  const p4=longRunHudFocusPolicy(4*3600,false,false);
  const p8=longRunHudFocusPolicy(8*3600,false,false);
  assert.ok(p2.statusMaxChars>p4.statusMaxChars&&p4.statusMaxChars>p8.statusMaxChars);
  assert.ok(p2.maxBuildLabels>=p4.maxBuildLabels&&p4.maxBuildLabels>=p8.maxBuildLabels);
  assert.equal(p4.showXpNumbers,false);
  assert.equal(p8.showMeterText,false);
});

test('phase 441 boss and mythic focus reduce optional text further but preserve essential bars and danger semantics',()=>{
  const boss=longRunHudFocusPolicy(5*3600,true,false);
  const mythic=longRunHudFocusPolicy(9*3600,true,true);
  assert.ok(boss.maxBuildLabels<=2);
  assert.equal(mythic.maxBuildLabels,1);
  assert.equal(mythic.keepHpBar,true);
  assert.equal(mythic.keepXpBar,true);
  assert.equal(mythic.keepMeterBar,true);
  assert.equal(mythic.dangerTelegraphMultiplier,1);
});

test('phase 442 HUD focus never changes the nine-action combat contract',()=>{
  longRunHudFocusPolicy(12*3600,true,true);
  assert.deepEqual(ACTION_BUTTONS.map(x=>x.id),['spell1','spell2','spell3','spell4','ultimate1','ultimate2','potion','shop','auto']);
});
