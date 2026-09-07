import test from 'node:test';
import assert from 'node:assert/strict';
import {
  projectileReadabilityContrastPresentation,
  impactReadabilityContrastPresentation,
  hazardReadabilityContrastPresentation,
  safeLaneReadabilityContrastPresentation,
  readabilityContrastBudgetPresentation,
} from '../dist/game/threat-impact-readability-contrast-rendering.js';

test('dense chroma budget tightens strong secondary color envelope from three to one',()=>{
  const low=readabilityContrastBudgetPresentation({criticalCount:0,crowd:.1,bossActive:false,safeLaneVisible:false});
  const dense=readabilityContrastBudgetPresentation({criticalCount:3,crowd:1,bossActive:true,safeLaneVisible:true});
  assert.equal(low.strongChromaLimit,3);
  assert.equal(dense.strongChromaLimit,1);
  assert.equal(dense.canonicalChromaScale,1);
  assert.equal(dense.safeLaneChromaScale,1);
  assert.ok(dense.secondaryChromaScale<low.secondaryChromaScale);
});

test('dense family admission actively separates projectile, hazard, and impact chroma',()=>{
  const projectile=projectileReadabilityContrastPresentation({bodyFloor:.2,trailScale:1,critical:false,bossActive:false,crowd:1});
  const hazard=hazardReadabilityContrastPresentation({edgeFloor:.2,fillScale:1,telegraph:false,critical:false,crowd:1});
  const impact=impactReadabilityContrastPresentation({edgeFloor:.2,fillScale:1,critical:false,bossActive:false,crowd:1});
  assert.ok(projectile.chromaScale>hazard.chromaScale);
  assert.ok(hazard.chromaScale>impact.chromaScale);
});

test('protected color families remain canonical under dense chroma pressure',()=>{
  const projectile=projectileReadabilityContrastPresentation({bodyFloor:.2,trailScale:1,critical:true,bossActive:true,crowd:1});
  const telegraph=hazardReadabilityContrastPresentation({edgeFloor:.2,fillScale:1,telegraph:true,critical:true,crowd:1});
  const lane=safeLaneReadabilityContrastPresentation({pathFloor:.5,confidence:1,critical:true,bossActive:true,crowd:1});
  assert.equal(projectile.chromaScale,1);
  assert.equal(telegraph.chromaScale,1);
  assert.equal(lane.chromaScale,1);
});
