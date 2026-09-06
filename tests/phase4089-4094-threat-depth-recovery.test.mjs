import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as recovery from '../dist/game/threat-impact-depth-recovery-rendering.js';

const projectile=recovery.projectileDepthRecoveryPresentation;
const safeLane=recovery.safeLaneDepthRecoveryPresentation;
const impact=recovery.impactDepthHandoffPresentation;
const telegraph=recovery.bossTelegraphDepthReleasePresentation;
const specialist=recovery.specialistDepthRecoveryPresentation;
const budget=recovery.depthRecoveryBudgetPresentation;

test('Phase 4089 projectile trail recovers gradually after body occlusion clears',()=>{
  const occluded=projectile?.({occlusion:.9,release:.2,pressure:.8,critical:false},false);
  const clearing=projectile?.({occlusion:.25,release:.75,pressure:.8,critical:false},false);
  assert.ok(occluded&&clearing);
  assert.equal(clearing.bodyAlphaScale,1);
  assert.ok(clearing.trailAlphaScale>occluded.trailAlphaScale);
  assert.ok(clearing.trailAlphaScale<=1);
});

test('Phase 4090 safe-lane crossing restores trail only after lane protection releases',()=>{
  const protectedLane=safeLane?.({laneProximity:.92,confidence:.9,release:.2,critical:false},false,false);
  const released=safeLane?.({laneProximity:.12,confidence:.9,release:.85,critical:false},false,false);
  assert.ok(protectedLane&&released);
  assert.ok(protectedLane.safeLaneAlphaScale>=1);
  assert.ok(released.trailAlphaScale>protectedLane.trailAlphaScale);
});

test('Phase 4091 hero-near impact hands fill depth to edge as it ages',()=>{
  const fresh=impact?.({life:.88,heroProximity:.9,neighborCount:7,critical:false},false);
  const old=impact?.({life:.18,heroProximity:.9,neighborCount:7,critical:false},false);
  assert.ok(fresh&&old);
  assert.ok(old.fillAlphaScale<fresh.fillAlphaScale);
  assert.ok(old.edgeAlphaScale>=old.fillAlphaScale);
});

test('Phase 4092 telegraph release cannot cause a stale impact fill rebound',()=>{
  const covered=telegraph?.({telegraphLife:.8,impactLife:.35,overlap:.9},false);
  const releasing=telegraph?.({telegraphLife:.15,impactLife:.2,overlap:.35},false);
  assert.ok(covered&&releasing);
  assert.ok(covered.telegraphEdgeAlphaScale>=.9);
  assert.ok(releasing.impactFillAlphaScale<=covered.impactFillAlphaScale+.18);
});

test('Phase 4093 specialist direction remains readable while hazard pressure recovers',()=>{
  const attack=specialist?.({owner:'attack',recovery:.35,hazardPressure:.9},false);
  const late=specialist?.({owner:'locomotion',recovery:.9,hazardPressure:.2},false);
  assert.ok(attack&&late);
  assert.equal(attack.bodyAlphaScale,1);
  assert.ok(attack.directionAlphaScale>=.78);
  assert.ok(late.trailAlphaScale>attack.trailAlphaScale);
});

test('Phase 4094 depth recovery budget prevents many secondary layers reappearing together',()=>{
  const dense=budget?.({recoveringCount:10,pressure:.9,criticalCount:2},false,false);
  const sparse=budget?.({recoveringCount:2,pressure:.2,criticalCount:0},false,false);
  assert.ok(dense&&sparse);
  assert.equal(dense.criticalAlphaScale,1);
  assert.equal(dense.canonicalBodyAlphaScale,1);
  assert.ok(dense.secondaryRecoveryScale<sparse.secondaryRecoveryScale);
});

test('Phase 4089-4094 live battlefield renderers consume depth recovery helpers',()=>{
  const enemies=fs.readFileSync('src/game/enemies.ts','utf8');
  const spells=fs.readFileSync('src/game/spells.ts','utf8');
  const game=fs.readFileSync('src/game/game.ts','utf8');
  assert.match(enemies,/projectileDepthRecoveryPresentation/);
  assert.match(enemies+game,/safeLaneDepthRecoveryPresentation/);
  assert.match(spells,/impactDepthHandoffPresentation/);
  assert.match(spells+game,/bossTelegraphDepthReleasePresentation/);
  assert.match(enemies,/specialistDepthRecoveryPresentation/);
  assert.match(enemies+spells+game,/depthRecoveryBudgetPresentation/);
});
