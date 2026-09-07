import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  hazardReadabilityContrastPresentation,
  safeLaneReadabilityContrastPresentation,
  specialistReadabilityContrastPresentation,
  readabilityContrastBudgetPresentation,
} from '../dist/game/threat-impact-readability-contrast-rendering.js';

const src=(path)=>fs.readFileSync(new URL(`../src/game/${path}`,import.meta.url),'utf8');

test('protected dash owners keep canonical cadence while secondary patterns open under crowding',()=>{
  const hazard=hazardReadabilityContrastPresentation({edgeFloor:.2,fillScale:1,telegraph:false,critical:false,crowd:1});
  const telegraph=hazardReadabilityContrastPresentation({edgeFloor:.2,fillScale:1,telegraph:true,critical:true,crowd:1});
  const lane=safeLaneReadabilityContrastPresentation({pathFloor:.5,confidence:1,critical:true,bossActive:true,crowd:1});
  const memory=specialistReadabilityContrastPresentation({silhouetteFloor:.3,trailScale:1,owner:'recovery',critical:false,crowd:1});
  assert.ok(hazard.dashGapScale>1);
  assert.equal(telegraph.dashGapScale,1);
  assert.equal(lane.dashGapScale,1);
  assert.ok(memory.dashGapScale>1);
});

test('dash budget preserves canonical cadence and increases secondary spacing under stress',()=>{
  const low=readabilityContrastBudgetPresentation({criticalCount:0,crowd:.1,bossActive:false,safeLaneVisible:false});
  const dense=readabilityContrastBudgetPresentation({criticalCount:3,crowd:1,bossActive:true,safeLaneVisible:true});
  assert.equal(dense.canonicalDashGapScale,1);
  assert.equal(dense.safeLaneDashGapScale,1);
  assert.ok(dense.secondaryDashGapScale>low.secondaryDashGapScale);
});

test('live safe lane remains canonical while forecast and hazard residue consume dash spacing scales',()=>{
  const game=src('game.ts');
  assert.match(game,/ctx\.setLineDash\(\[7,7\]\)/);
  assert.match(game,/forecastDashGapScale/);
  assert.match(game,/hazardDashGapScale/);
});
