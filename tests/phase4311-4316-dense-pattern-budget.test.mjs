import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  hazardReadabilityContrastPresentation,
  safeLaneReadabilityContrastPresentation,
  readabilityContrastBudgetPresentation,
} from '../dist/game/threat-impact-readability-contrast-rendering.js';

const src=(path)=>fs.readFileSync(new URL(`../src/game/${path}`,import.meta.url),'utf8');

test('dense pattern budget tightens strong secondary dash envelope from three to one',()=>{
  const low=readabilityContrastBudgetPresentation({criticalCount:0,crowd:.1,bossActive:false,safeLaneVisible:false});
  const dense=readabilityContrastBudgetPresentation({criticalCount:3,crowd:1,bossActive:true,safeLaneVisible:true});
  assert.equal(low.strongPatternLimit,3);
  assert.equal(dense.strongPatternLimit,1);
  assert.equal(dense.canonicalDashGapScale,1);
  assert.equal(dense.safeLaneDashGapScale,1);
  assert.ok(dense.secondaryDashGapScale>low.secondaryDashGapScale);
});

test('dense family admission actively demotes normal hazard pattern while protected lane remains canonical',()=>{
  const hazard=hazardReadabilityContrastPresentation({edgeFloor:.2,fillScale:1,telegraph:false,critical:false,crowd:1});
  const lane=safeLaneReadabilityContrastPresentation({pathFloor:.5,confidence:1,critical:true,bossActive:true,crowd:1});
  assert.equal(hazard.strongPattern,false);
  assert.equal(lane.strongPattern,true);
  assert.ok(hazard.dashGapScale>1);
  assert.equal(lane.dashGapScale,1);
});

test('live forecast footprint and residue patterns consume dense family demotion scales',()=>{
  const game=src('game.ts');
  assert.match(game,/denseDashFamilyPresentation\(\{family:'forecast'/);
  assert.match(game,/denseDashFamilyPresentation\(\{family:'footprint'/);
  assert.match(game,/denseDashFamilyPresentation\(\{family:'residue'/);
  assert.match(game,/hazardFootprintPattern\.dashGapScale/);
  assert.match(game,/hazardResiduePattern\.dashGapScale/);
});
