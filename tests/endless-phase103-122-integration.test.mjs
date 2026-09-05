import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ACTION_BUTTONS } from '../dist/game/config.js';
import { createDefaultEndlessState } from '../dist/game/endless/runtime.js';
import { restoreExtension, serializeExtension } from '../dist/game/endless/snapshot.js';

const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const input=fs.readFileSync(new URL('../src/core/input.ts',import.meta.url),'utf8');

test('phase 103-122 preserves exactly nine combat actions',()=>{
  assert.equal(ACTION_BUTTONS.length,9);
  assert.deepEqual(ACTION_BUTTONS.map((x)=>x.id),['spell1','spell2','spell3','spell4','ultimate1','ultimate2','potion','shop','auto']);
});

test('replay guidance and landscape status are wired into the existing four-line HUD',()=>{
  assert.match(game,/replayGuidance\(/);
  assert.match(game,/compactLandscapeStatusLine\(/);
  assert.match(game,/\.slice\(0, 4\)/);
});

test('mythic arena identity and final-form mobility are composed into real combat paths',()=>{
  assert.match(game,/mythicArenaIdentityProfile\(/);
  assert.match(game,/advanceFinalFormMotion\(/);
  assert.match(game,/signatureMobilityImpulse\(/);
});

test('run milestone recap persists in endless snapshot and is handled without a modal',()=>{
  const state=createDefaultEndlessState(4);
  state.recaps={reachedMilestones:[120,240],lastKills:9000,lastBosses:12};
  assert.deepEqual(restoreExtension(serializeExtension(state),1).recaps,state.recaps);
  assert.match(game,/effect\.type === 'run_milestone_recap'/);
  assert.doesNotMatch(game,/run_milestone_recap[\s\S]{0,200}\.open\(/);
});

test('landscape joystick uses HUD-safe start and clamped origin',()=>{
  assert.match(input,/shouldStartLandscapeJoystick\(joystickPoint, safeArea\)/);
  assert.match(input,/safeJoystickOrigin\(p, safeArea\)/);
});
