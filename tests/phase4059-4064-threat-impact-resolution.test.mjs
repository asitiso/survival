import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as resolution from '../dist/game/threat-impact-resolution-rendering.js';

const projectile = resolution.projectileCanonicalReclaimPresentation;
const impact = resolution.impactFootprintRetirementPresentation;
const hazard = resolution.hazardGroundResolutionPresentation;
const safeLane = resolution.safeLaneCanonicalResolutionPresentation;
const silhouette = resolution.silhouetteLocomotionSettlePresentation;
const budget = resolution.continuityResolutionBudgetPresentation;

test('Phase 4059 projectile transition retires while canonical body reclaims full readability', () => {
  const travel = projectile?.({ owner:'travel', launchLife:0, travelLife:.72, speed:360 }, false, false);
  const canonical = projectile?.({ owner:'canonical', launchLife:0, travelLife:0, speed:360 }, false, false);
  assert.ok(travel && canonical);
  assert.ok(travel.transitionAlphaScale > canonical.transitionAlphaScale);
  assert.ok(canonical.bodyAlphaScale > travel.bodyAlphaScale);
  assert.equal(canonical.bodyAlphaScale, 1);
});

test('Phase 4060 late impact footprint retires before response and death aftermath persists longer than hit', () => {
  const hitLate = impact?.({ life:.12, reaction:'hit' }, false);
  const deathLate = impact?.({ life:.12, reaction:'death' }, false);
  const hitEarly = impact?.({ life:.82, reaction:'hit' }, false);
  assert.ok(hitLate && deathLate && hitEarly);
  assert.ok(hitLate.footprintAlphaScale < hitEarly.footprintAlphaScale);
  assert.ok(hitLate.footprintAlphaScale < hitLate.responseAlphaScale);
  assert.ok(deathLate.aftermathAlphaScale > hitLate.aftermathAlphaScale);
});

test('Phase 4061 active hazard never emits cleared-ground safety ownership', () => {
  const active = hazard?.({ hazardActive:true, hazardLife:.08, memoryLife:.9 }, false);
  const cleared = hazard?.({ hazardActive:false, hazardLife:0, memoryLife:.9 }, false);
  assert.ok(active && cleared);
  assert.equal(active.owner, 'hazard');
  assert.equal(active.clearedGroundAlphaScale, 0);
  const activeReducedFlash = hazard?.({ hazardActive:true, hazardLife:.08, memoryLife:.9 }, true);
  assert.ok(activeReducedFlash && activeReducedFlash.hazardEdgeAlphaScale >= .9);
  assert.equal(cleared.owner, 'cleared');
  assert.ok(cleared.clearedGroundAlphaScale > 0);
});

test('Phase 4062 safe lane boost normalizes exactly to canonical alpha when release pressure is gone', () => {
  const release = safeLane?.({ release:.8, hazardPressure:.52, memoryCount:3 }, false);
  const canonical = safeLane?.({ release:0, hazardPressure:0, memoryCount:0 }, false);
  assert.ok(release && canonical);
  assert.ok(release.safeLaneAlphaScale > 1);
  assert.equal(canonical.safeLaneAlphaScale, 1);
  assert.equal(canonical.edgeAlphaScale, 1);
});

test('Phase 4063 locomotion settle returns transition decoration to neutral without dimming body', () => {
  const recovery = silhouette?.({ owner:'recovery', locomotionWeight:.56, motionBlend:.72, turn:.18 }, false);
  const locomotion = silhouette?.({ owner:'locomotion', locomotionWeight:1, motionBlend:.72, turn:.18 }, false);
  assert.ok(recovery && locomotion);
  assert.ok(recovery.overlayAlphaScale < locomotion.overlayAlphaScale);
  assert.equal(locomotion.overlayAlphaScale, 1);
  assert.equal(locomotion.trailScale, 1);
  assert.equal(locomotion.bodyAlphaScale, 1);
});

test('Phase 4064 resolution budget removes older transition decoration but never canonical readability', () => {
  const newest = budget?.({ activeCount:8, indexFromNewest:0, kind:'impact' }, false);
  const oldest = budget?.({ activeCount:8, indexFromNewest:7, kind:'impact' }, false);
  assert.ok(newest && oldest);
  assert.equal(newest.visible, true);
  assert.equal(oldest.visible, false);
  assert.ok(newest.effectStrength > oldest.effectStrength);
  assert.equal(oldest.bodyAlphaScale, 1);
  assert.equal(oldest.safeLaneAlphaScale, 1);
});

test('Phase 4059-4064 live renderers consume final resolution helpers', () => {
  const enemies = fs.readFileSync('src/game/enemies.ts', 'utf8');
  const spells = fs.readFileSync('src/game/spells.ts', 'utf8');
  const game = fs.readFileSync('src/game/game.ts', 'utf8');
  assert.match(enemies, /projectileCanonicalReclaimPresentation/);
  assert.match(enemies, /silhouetteLocomotionSettlePresentation/);
  assert.match(spells, /impactFootprintRetirementPresentation/);
  assert.match(game, /hazardGroundResolutionPresentation/);
  assert.match(game, /safeLaneCanonicalResolutionPresentation/);
  assert.match(enemies + spells + game, /continuityResolutionBudgetPresentation/);
});
