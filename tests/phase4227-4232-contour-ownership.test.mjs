import test from 'node:test';
import assert from 'node:assert/strict';
import {
  projectileContourOwnershipPresentation,
  impactContourOwnershipPresentation,
  hazardContourOwnershipPresentation,
  safeLaneContourOwnershipPresentation,
  specialistContourOwnershipPresentation,
  contourOwnershipBudgetPresentation,
} from '../dist/game/threat-impact-contour-ownership-rendering.js';
import {projectileReadabilityContrastPresentation,impactReadabilityContrastPresentation,hazardReadabilityContrastPresentation,safeLaneReadabilityContrastPresentation,specialistReadabilityContrastPresentation,readabilityContrastBudgetPresentation} from '../dist/game/threat-impact-readability-contrast-rendering.js';

test('protected contours stay canonical while secondary contours yield under overlap', () => {
  const projectile = projectileContourOwnershipPresentation({critical:true,bossActive:true,overlap:1});
  const impact = impactContourOwnershipPresentation({critical:false,bossActive:true,overlap:1});
  const hazard = hazardContourOwnershipPresentation({telegraph:true,critical:true,overlap:1});
  const lane = safeLaneContourOwnershipPresentation({visible:true,confidence:.8,overlap:1});
  const specialist = specialistContourOwnershipPresentation({owner:'recovery',critical:false,overlap:1});
  assert.equal(projectile.canonicalContourScale, 1);
  assert.equal(hazard.canonicalContourScale, 1);
  assert.equal(lane.canonicalContourScale, 1);
  assert.ok(impact.secondaryContourScale < projectile.secondaryContourScale);
  assert.ok(specialist.secondaryContourScale < projectile.secondaryContourScale);
  assert.ok(lane.secondaryContourScale > impact.secondaryContourScale);
});

test('overlap compresses only secondary contour budget', () => {
  const low = contourOwnershipBudgetPresentation({criticalCount:0,crowd:.1,bossActive:false,safeLaneVisible:false});
  const high = contourOwnershipBudgetPresentation({criticalCount:3,crowd:1,bossActive:true,safeLaneVisible:true});
  assert.equal(high.canonicalContourScale, 1);
  assert.equal(high.safeLaneContourScale, 1);
  assert.ok(high.secondaryContourScale < low.secondaryContourScale);
  assert.equal(high.presentationOnly, true);
  assert.equal('wholeVfxScale' in high, false);
});

test('contour integration preserves canonical readability floors',()=>{
  const p=projectileReadabilityContrastPresentation({bodyFloor:.2,trailScale:1,critical:true,bossActive:true,crowd:1});
  const i=impactReadabilityContrastPresentation({edgeFloor:.2,fillScale:1,critical:true,bossActive:true,crowd:1});
  const h=hazardReadabilityContrastPresentation({edgeFloor:.2,fillScale:1,telegraph:true,critical:true,crowd:1});
  const l=safeLaneReadabilityContrastPresentation({pathFloor:.2,confidence:1,critical:true,bossActive:true,crowd:1});
  const s=specialistReadabilityContrastPresentation({silhouetteFloor:.2,trailScale:1,owner:'attack',critical:true,crowd:1});
  assert.ok(p.bodyAlphaFloor>=.58);
  assert.ok(i.edgeAlphaFloor>=.45);
  assert.ok(h.edgeAlphaFloor>=.52);
  assert.ok(l.pathAlphaFloor>=.78);
  assert.ok(s.silhouetteAlphaFloor>=.5);
  for(const v of [p.trailScale,i.fillScale,h.fillScale,l.decorativeScale,s.trailScale]) assert.ok(v>=0&&v<=1);
});

test('dense secondary material yields without lowering primary budget',()=>{
  const low=readabilityContrastBudgetPresentation({criticalCount:0,crowd:0,bossActive:false,safeLaneVisible:false});
  const high=readabilityContrastBudgetPresentation({criticalCount:3,crowd:1,bossActive:true,safeLaneVisible:true});
  assert.equal(high.primaryScale,1);
  assert.ok(high.secondaryScale<low.secondaryScale);
  assert.ok(high.safeLaneScale>=1);
});
