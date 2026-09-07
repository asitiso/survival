import test from 'node:test';
import assert from 'node:assert/strict';
import {denseEdgeFamilyPresentation,denseEdgeBudgetPresentation} from '../dist/game/threat-impact-dense-edge-budget-rendering.js';
import {projectileReadabilityContrastPresentation,impactReadabilityContrastPresentation,hazardReadabilityContrastPresentation,readabilityContrastBudgetPresentation} from '../dist/game/threat-impact-readability-contrast-rendering.js';

test('dense edge budget tightens strong secondary envelope while canonical edges stay protected',()=>{
  const low=denseEdgeBudgetPresentation({criticalCount:0,crowd:.1,bossActive:false,safeLaneVisible:false});
  const dense=denseEdgeBudgetPresentation({criticalCount:3,crowd:1,bossActive:true,safeLaneVisible:true});
  assert.equal(low.strongSecondaryLimit,3);
  assert.equal(dense.strongSecondaryLimit,1);
  assert.equal(dense.canonicalContourScale,1);
  assert.equal(dense.safeLaneContourScale,1);
  assert.ok(dense.secondaryContourScale<low.secondaryContourScale);
});

test('protected high-risk families remain stronger than decorative/internal families under density',()=>{
  const projectile=denseEdgeFamilyPresentation({family:'projectile',crowd:1,critical:true,bossProtected:false,safeLaneVisible:true});
  const impact=denseEdgeFamilyPresentation({family:'impact',crowd:1,critical:false,bossProtected:false,safeLaneVisible:true});
  const telegraph=denseEdgeFamilyPresentation({family:'hazard',crowd:1,critical:true,bossProtected:true,safeLaneVisible:true});
  const lane=denseEdgeFamilyPresentation({family:'safeLane',crowd:1,critical:false,bossProtected:false,safeLaneVisible:true});
  assert.equal(lane.secondaryContourScale,1);
  assert.ok(projectile.secondaryContourScale>impact.secondaryContourScale);
  assert.ok(telegraph.secondaryContourScale>impact.secondaryContourScale);
  assert.ok(projectile.canonicalContourScale===1&&impact.canonicalContourScale===1&&telegraph.canonicalContourScale===1);
});

test('live readability composition gives dense internal impact less edge weight than protected projectile and telegraph',()=>{
  const p=projectileReadabilityContrastPresentation({bodyFloor:.2,trailScale:1,critical:true,bossActive:false,crowd:1});
  const i=impactReadabilityContrastPresentation({edgeFloor:.2,fillScale:1,critical:false,bossActive:false,crowd:1});
  const h=hazardReadabilityContrastPresentation({edgeFloor:.2,fillScale:1,telegraph:true,critical:true,crowd:1});
  assert.ok(p.trailScale>i.fillScale);
  assert.ok(h.edgeAlphaFloor>=.52);
});

test('dense budget integration leaves primary scale canonical',()=>{
  const dense=readabilityContrastBudgetPresentation({criticalCount:3,crowd:1,bossActive:true,safeLaneVisible:true});
  assert.equal(dense.primaryScale,1);
  assert.ok(dense.secondaryScale<.6);
  assert.ok(dense.safeLaneScale>=1);
});

test('dense budget explicitly reserves room when a safe lane is visible',()=>{
  const withoutLane=denseEdgeBudgetPresentation({criticalCount:2,crowd:.8,bossActive:true,safeLaneVisible:false});
  const withLane=denseEdgeBudgetPresentation({criticalCount:2,crowd:.8,bossActive:true,safeLaneVisible:true});
  assert.ok(withLane.secondaryContourScale<withoutLane.secondaryContourScale);
  assert.equal(withLane.safeLaneContourScale,1);
});

test('dense strong-secondary limit actively demotes lower-priority families',()=>{
  const budget=denseEdgeBudgetPresentation({criticalCount:3,crowd:1,bossActive:true,safeLaneVisible:true});
  const families=['projectile','hazard','specialist','impact'].map(family=>denseEdgeFamilyPresentation({family,crowd:1,critical:false,bossProtected:false,safeLaneVisible:true,strongSecondaryLimit:budget.strongSecondaryLimit}));
  assert.equal(budget.strongSecondaryLimit,1);
  assert.equal(families.filter(x=>x.strongSecondary).length,1);
  assert.ok(families.slice(1).every(x=>x.secondaryContourScale<=.84));
});
