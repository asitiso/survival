import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ACTION_BUTTONS } from '../dist/game/config.js';
import { rasterReleaseQualityGate } from '../dist/game/render-raster-release-gate.js';

const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const input=fs.readFileSync(new URL('../src/core/input.ts',import.meta.url),'utf8');
const snapshot=fs.readFileSync(new URL('../src/game/endless/snapshot.ts',import.meta.url),'utf8');
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));

test('phase 263-282 preserves exactly nine combat actions',()=>{ assert.equal(ACTION_BUTTONS.length,9); });

test('game wires tactic attack link, Last Law timeline, and twelve-form finisher signature',()=>{
  assert.match(game,/createMythicTacticAttackLink\(/);
  assert.match(game,/lastLawSafeTimeline\(/);
  assert.match(game,/finalFormFinisherSignature\(/);
});

test('foldable dead-space resolver is additive and normal action path remains unchanged',()=>{
  assert.match(input,/resolveFoldableDeadSpace\(/);
  assert.match(input,/: hitTestActionButton\(p\);/);
});

test('phase 263-282 does not add transient combat state to endless snapshot schema',()=>{
  for(const name of ['mythicTacticAttackLink','lastLawSafeTimeline','finisherSignature','foldableDeadSpace']) assert.equal(snapshot.includes(name),false);
});

test('release gate is available as npm command and current release contract passes',()=>{
  assert.ok(pkg.scripts['verify:release']);
  const gate=rasterReleaseQualityGate();
  assert.equal(gate.ok,true);
  assert.equal(gate.actionCount,9);
  assert.equal(gate.profileCount,5);
});
