import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ACTION_BUTTONS } from '../dist/game/config.js';
import { defaultRasterCiDiffSummary } from '../dist/game/render-raster-ci-summary.js';

const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const input=fs.readFileSync(new URL('../src/core/input.ts',import.meta.url),'utf8');
const snapshot=fs.readFileSync(new URL('../src/game/endless/snapshot.ts',import.meta.url),'utf8');

test('phase 243-262 preserves exactly nine combat actions',()=>{
  assert.equal(ACTION_BUTTONS.length,9);
  assert.deepEqual(ACTION_BUTTONS.map((b)=>b.id),['spell1','spell2','spell3','spell4','ultimate1','ultimate2','potion','shop','auto']);
});

test('new combat polish remains transient and adds no endless snapshot field',()=>{
  for(const token of ['finisherFeedback','safeTelegraphTimeline','mythicTacticBoost','foldableThumbZones','rasterCiDiffSummary']) assert.equal(snapshot.includes(token),false,token);
});

test('game wires finisher feedback timeline and tactic reward into existing seams',()=>{
  for(const token of ['finalFormFinisherFeedback','safeTelegraphTimeline','mythicTacticReward','mythicTacticBoostUntilMs']) assert.ok(game.includes(token),token);
  assert.ok(game.includes('safeLinkStep.reward'));
  assert.ok(game.includes('finisherFeedback.soundKind'));
});

test('foldable thumb ownership is input-only and normal hit testing stays unchanged',()=>{
  assert.ok(input.includes('foldableThumbIntent'));
  assert.ok(input.includes("thumbIntent === 'right'"));
  assert.ok(input.includes("thumbIntent === 'left'"));
  assert.ok(input.includes(': hitTestActionButton(p)'));
});

test('default raster CI gate passes current five committed viewports',()=>{
  const summary=defaultRasterCiDiffSummary();
  assert.equal(summary.ok,true);
  assert.equal(summary.lines.length,5);
  assert.equal(summary.exitCode,0);
});
