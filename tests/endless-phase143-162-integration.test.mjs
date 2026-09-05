import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ACTION_BUTTONS } from '../dist/game/config.js';

const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const input=fs.readFileSync(new URL('../src/core/input.ts',import.meta.url),'utf8');
const arena=fs.readFileSync(new URL('../src/game/boss-arena.ts',import.meta.url),'utf8');
const main=fs.readFileSync(new URL('../src/main.ts',import.meta.url),'utf8');
const snapshot=fs.readFileSync(new URL('../src/game/endless/snapshot.ts',import.meta.url),'utf8');

test('phase 143-162 preserves exactly nine combat actions and no new blocking controls',()=>{
  assert.equal(ACTION_BUTTONS.length,9);
  assert.doesNotMatch(game,/flowFeedbackButton|waveCeremonyButton|safeAreaButton|visualProbeButton/);
});

test('shape collision, flow feedback, opening pulse, and adaptive safe-area are wired into runtime paths',()=>{
  assert.match(arena,/mythicArenaHazardContact\(/);
  assert.match(game,/bossArena\.contactAt\(/);
  assert.match(game,/flowFeedbackProfile\(/);
  assert.match(game,/openingWaveCeremony\(/);
  assert.match(game,/landscapeSafeAreaProfile\(/);
  assert.match(input,/landscapeSafeAreaProfile\(/);
});

test('new runtime finish state remains transient and does not expand snapshot schema',()=>{
  assert.doesNotMatch(snapshot,/openingWaveSeen|flowFeedbackCue|landscapeSafeArea/);
});

test('main exposes visual probe query hook without replacing normal game startup',()=>{
  assert.match(main,/visualRegressionProbe\(/);
  assert.match(main,/visualProbe/);
  assert.match(main,/game\.start\(\)/);
});
