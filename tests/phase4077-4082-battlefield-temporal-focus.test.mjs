import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as temporal from '../dist/game/threat-impact-temporal-focus-rendering.js';

const projectile=temporal.projectileFocusHoldPresentation;
const impact=temporal.impactBurstSettlePresentation;
const hazard=temporal.hazardCorridorStabilityPresentation;
const safeLane=temporal.safeLaneAttentionHoldPresentation;
const silhouette=temporal.silhouetteContrastRecoveryPresentation;
const budget=temporal.temporalThreatBudgetPresentation;

test('Phase 4077 critical projectile focus retains canonical readability through release',()=>{
  const critical=projectile?.({critical:true,life:.36,release:.7,pressure:.9},false);
  const normal=projectile?.({critical:false,life:.36,release:.7,pressure:.9},false);
  assert.ok(critical&&normal);
  assert.equal(critical.bodyAlphaScale,1);
  assert.equal(critical.criticalAlphaScale,1);
  assert.ok(critical.directionAlphaScale>=normal.directionAlphaScale);
});

test('Phase 4078 older dense impact bursts settle before fresh impacts',()=>{
  const old=impact?.({life:.18,neighborCount:8,critical:false},false);
  const fresh=impact?.({life:.86,neighborCount:8,critical:false},false);
  assert.ok(old&&fresh);
  assert.ok(old.decorationAlphaScale<fresh.decorationAlphaScale);
  assert.ok(old.edgeAlphaScale>=old.decorationAlphaScale);
});

test('Phase 4079 hazard corridor stability keeps active edge while carving fill near safe lane',()=>{
  const near=hazard?.({active:true,life:.22,laneProximity:.94,pressure:.9},false);
  const far=hazard?.({active:true,life:.22,laneProximity:.05,pressure:.9},false);
  assert.ok(near&&far);
  assert.ok(near.fillAlphaScale<far.fillAlphaScale);
  assert.ok(near.edgeAlphaScale>=.9);
});

test('Phase 4080 safe-lane attention hold never dips during critical pressure',()=>{
  const critical=safeLane?.({confidence:.82,critical:true,pressure:.95,release:.25},false);
  const calm=safeLane?.({confidence:.82,critical:false,pressure:.05,release:1},false);
  assert.ok(critical&&calm);
  assert.ok(critical.pathAlphaFloor>=.9);
  assert.ok(critical.safeLaneAlphaScale>=calm.safeLaneAlphaScale);
});

test('Phase 4081 silhouette contrast recovers toward neutral after threat clears',()=>{
  const early=silhouette?.({owner:'recovery',recovery:.2,pressure:.75},false);
  const late=silhouette?.({owner:'locomotion',recovery:.92,pressure:.05},false);
  assert.ok(early&&late);
  assert.equal(early.bodyAlphaScale,1);
  assert.equal(late.bodyAlphaScale,1);
  assert.ok(late.overlayAlphaScale>early.overlayAlphaScale);
  assert.ok(late.trailAlphaScale>early.trailAlphaScale);
});

test('Phase 4082 temporal budget suppresses churn before critical and safe-lane layers',()=>{
  const dense=budget?.({churn:.95,pressure:.92,criticalCount:2},false,false);
  const calm=budget?.({churn:.05,pressure:.08,criticalCount:0},false,false);
  assert.ok(dense&&calm);
  assert.equal(dense.criticalAlphaScale,1);
  assert.ok(dense.safeLaneAlphaScale>=1);
  assert.ok(dense.secondaryAlphaScale<calm.secondaryAlphaScale);
});

test('Phase 4077-4082 live battlefield renderers consume temporal focus helpers',()=>{
  const enemies=fs.readFileSync('src/game/enemies.ts','utf8');
  const spells=fs.readFileSync('src/game/spells.ts','utf8');
  const game=fs.readFileSync('src/game/game.ts','utf8');
  assert.match(enemies,/projectileFocusHoldPresentation/);
  assert.match(spells,/impactBurstSettlePresentation/);
  assert.match(game,/hazardCorridorStabilityPresentation/);
  assert.match(game,/safeLaneAttentionHoldPresentation/);
  assert.match(enemies,/silhouetteContrastRecoveryPresentation/);
  assert.match(enemies+spells+game,/temporalThreatBudgetPresentation/);
});
