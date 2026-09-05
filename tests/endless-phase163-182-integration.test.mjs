import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ACTION_BUTTONS } from '../dist/game/config.js';
import { auditRenderContract, renderContract } from '../dist/game/render-contract.js';

const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const input=fs.readFileSync(new URL('../src/core/input.ts',import.meta.url),'utf8');
const main=fs.readFileSync(new URL('../src/main.ts',import.meta.url),'utf8');
const snapshot=fs.readFileSync(new URL('../src/game/endless/snapshot.ts',import.meta.url),'utf8');

test('phase 163-182 preserves exactly nine actions and adds no blocking controls',()=>{
  assert.equal(ACTION_BUTTONS.length,9);
  assert.doesNotMatch(game,/arenaDodgeButton|flowImpactButton|bossEntranceButton|renderContractButton/);
});

test('arena evade, flow impact, boss entrance, and adaptive safe area are wired into runtime',()=>{
  assert.match(game,/advanceArenaDodgeTracker\(/);
  assert.match(game,/flowImpactProfile\(/);
  assert.match(game,/openingBossEntrance\(/);
  assert.match(game,/landscapeSafeAreaProfile\(/);
  assert.match(input,/landscapeSafeAreaProfile\(/);
});

test('new combat polish state stays transient and does not expand endless snapshot schema',()=>{
  assert.doesNotMatch(snapshot,/arenaDodgeTracker|flowImpactTimer|lastOpeningBossEntranceStage|hingeExclusion/);
});

test('visual probe query exposes deterministic render contract audit while normal startup remains',()=>{
  assert.match(main,/renderContract\(/);
  assert.match(main,/auditRenderContract\(/);
  assert.match(main,/game\.start\(\)/);
  for(const [w,h] of [[1600,900],[2400,1080],[1200,900],[2208,1840],[3840,1080]])assert.equal(auditRenderContract(renderContract(w,h)).ok,true);
});
