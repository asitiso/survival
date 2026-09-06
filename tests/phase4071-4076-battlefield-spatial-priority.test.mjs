import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as spatial from '../dist/game/threat-impact-spatial-priority-rendering.js';

const projectile = spatial.projectileSpatialSeparationPresentation;
const impact = spatial.impactClusterCompressionPresentation;
const hazard = spatial.hazardSafeLaneCarvePresentation;
const safeLane = spatial.safeLaneCorridorReservationPresentation;
const silhouette = spatial.silhouetteLocalContrastPresentation;
const bossFocus = spatial.bossCriticalFocusReservationPresentation;

test('Phase 4071 projectile fan separation offsets dense trails without moving canonical body', () => {
  const dense = projectile?.({neighborCount:7,indexFromNewest:3,radius:14,bossCritical:false}, false);
  const calm = projectile?.({neighborCount:1,indexFromNewest:0,radius:14,bossCritical:false}, false);
  assert.ok(dense && calm);
  assert.ok(Math.abs(dense.lateralOffset) > Math.abs(calm.lateralOffset));
  assert.ok(dense.trailAlphaScale < calm.trailAlphaScale);
  assert.equal(dense.bodyAlphaScale, 1);
});

test('Phase 4072 clustered impacts compress decoration while preserving readable edge', () => {
  const dense = impact?.({neighborCount:8,secondary:true,life:.7}, false);
  const calm = impact?.({neighborCount:1,secondary:false,life:.7}, false);
  assert.ok(dense && calm);
  assert.ok(dense.radiusScale < calm.radiusScale);
  assert.ok(dense.fillAlphaScale < calm.fillAlphaScale);
  assert.ok(dense.edgeAlphaScale >= dense.fillAlphaScale);
});

test('Phase 4073 safe-lane proximity carves hazard fill but never erases active hazard edge', () => {
  const near = hazard?.({hazardActive:true,laneProximity:.95,pressure:.9}, false);
  const far = hazard?.({hazardActive:true,laneProximity:.05,pressure:.9}, false);
  assert.ok(near && far);
  assert.ok(near.fillAlphaScale < far.fillAlphaScale);
  assert.ok(near.hazardEdgeAlphaScale >= .9);
  assert.ok(near.safeLaneAlphaScale >= 1);
});

test('Phase 4074 safe-lane corridor reserves visibility under heavy local occlusion', () => {
  const dense = safeLane?.({confidence:.86,occlusion:.92,threatPressure:.9}, false);
  const calm = safeLane?.({confidence:.86,occlusion:.08,threatPressure:.1}, false);
  assert.ok(dense && calm);
  assert.ok(dense.pathAlphaFloor >= .88);
  assert.ok(dense.safeLaneAlphaScale >= calm.safeLaneAlphaScale);
  assert.ok(dense.decorationAlphaScale < calm.decorationAlphaScale);
});

test('Phase 4075 local silhouette contrast suppresses trail before body', () => {
  const dense = silhouette?.({threatProximity:.9,owner:'attack',specialist:true}, false);
  const calm = silhouette?.({threatProximity:.05,owner:'locomotion',specialist:true}, false);
  assert.ok(dense && calm);
  assert.equal(dense.bodyAlphaScale, 1);
  assert.ok(dense.trailAlphaScale < calm.trailAlphaScale);
  assert.ok(dense.overlayAlphaScale < calm.overlayAlphaScale);
});

test('Phase 4076 boss critical focus reserves boss and safe-lane layers under density', () => {
  const dense = bossFocus?.({bossSpecial:true,criticalCount:2,pressure:.96}, false);
  const calm = bossFocus?.({bossSpecial:false,criticalCount:0,pressure:.08}, false);
  assert.ok(dense && calm);
  assert.equal(dense.criticalAlphaScale, 1);
  assert.ok(dense.secondaryAlphaScale < calm.secondaryAlphaScale);
  assert.ok(dense.safeLaneAlphaScale >= 1);
});

test('Phase 4071-4076 live renderers consume spatial priority helpers', () => {
  const enemies = fs.readFileSync('src/game/enemies.ts', 'utf8');
  const spells = fs.readFileSync('src/game/spells.ts', 'utf8');
  const game = fs.readFileSync('src/game/game.ts', 'utf8');
  assert.match(enemies, /projectileSpatialSeparationPresentation/);
  assert.match(spells, /impactClusterCompressionPresentation/);
  assert.match(game, /hazardSafeLaneCarvePresentation/);
  assert.match(game, /safeLaneCorridorReservationPresentation/);
  assert.match(enemies, /silhouetteLocalContrastPresentation/);
  assert.match(enemies + game, /bossCriticalFocusReservationPresentation/);
});
