import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as depth from '../dist/game/threat-impact-depth-priority-rendering.js';

const projectileDepth=depth.projectileBodyOcclusionPresentation;
const telegraphDepth=depth.bossTelegraphImpactDepthPresentation;
const safeLaneCrossing=depth.safeLaneProjectileCrossingPresentation;
const heroImpact=depth.heroImpactInteriorRetirementPresentation;
const specialistDepth=depth.specialistHazardDepthPresentation;
const battlefieldDepth=depth.battlefieldDepthBudgetPresentation;

test('Phase 4083 projectile body stays canonical while overlapping trail yields to body depth',()=>{
  const clear=projectileDepth?.({bodyOcclusion:.05,density:.2,bossCritical:false},false);
  const occluded=projectileDepth?.({bodyOcclusion:.92,density:.9,bossCritical:false},false);
  assert.ok(clear&&occluded);
  assert.equal(occluded.bodyAlphaScale,1);
  assert.ok(occluded.trailAlphaScale<clear.trailAlphaScale);
});

test('Phase 4084 active boss telegraph edge wins over overlapping impact decoration',()=>{
  const overlap=telegraphDepth?.({telegraphActive:true,overlap:.95,impactLife:.8},false);
  const detached=telegraphDepth?.({telegraphActive:true,overlap:.05,impactLife:.8},false);
  assert.ok(overlap&&detached);
  assert.ok(overlap.telegraphEdgeAlphaScale>=.92);
  assert.ok(overlap.impactFillAlphaScale<detached.impactFillAlphaScale);
});

test('Phase 4085 projectile crossing safe lane trims trail before canonical projectile body',()=>{
  const near=safeLaneCrossing?.({laneProximity:.95,threatLevel:.72,critical:false},false,false);
  const far=safeLaneCrossing?.({laneProximity:.05,threatLevel:.72,critical:false},false,false);
  assert.ok(near&&far);
  assert.equal(near.bodyAlphaScale,1);
  assert.ok(near.trailAlphaScale<far.trailAlphaScale);
  assert.ok(near.safeLaneAlphaScale>=1);
});

test('Phase 4086 dense old impacts near hero retire fill before edge',()=>{
  const oldDense=heroImpact?.({heroProximity:.96,life:.18,neighborCount:8,critical:false},false);
  const freshSparse=heroImpact?.({heroProximity:.2,life:.88,neighborCount:2,critical:false},false);
  assert.ok(oldDense&&freshSparse);
  assert.ok(oldDense.fillAlphaScale<freshSparse.fillAlphaScale);
  assert.ok(oldDense.edgeAlphaScale>=oldDense.fillAlphaScale);
});

test('Phase 4087 specialist attack silhouette keeps body direction while hazard decoration yields',()=>{
  const attack=specialistDepth?.({owner:'attack',hazardPressure:.92,attackStrength:1},false);
  const locomotion=specialistDepth?.({owner:'locomotion',hazardPressure:.92,attackStrength:.1},false);
  assert.ok(attack&&locomotion);
  assert.equal(attack.bodyAlphaScale,1);
  assert.ok(attack.directionAlphaScale>=locomotion.directionAlphaScale);
  assert.ok(attack.hazardDecorationScale<1);
});

test('Phase 4088 battlefield depth budget preserves critical safe-lane and canonical body before secondary vfx',()=>{
  const dense=battlefieldDepth?.({criticalCount:2,bossTelegraph:true,safeLaneVisible:true,projectilePressure:.9,impactPressure:.9,hazardPressure:.9},false,false);
  const calm=battlefieldDepth?.({criticalCount:0,bossTelegraph:false,safeLaneVisible:false,projectilePressure:.05,impactPressure:.05,hazardPressure:.05},false,false);
  assert.ok(dense&&calm);
  assert.equal(dense.criticalAlphaScale,1);
  assert.equal(dense.canonicalBodyAlphaScale,1);
  assert.ok(dense.safeLaneAlphaScale>=1);
  assert.ok(dense.bossTelegraphEdgeAlphaScale>=.92);
  assert.ok(dense.secondaryAlphaScale<calm.secondaryAlphaScale);
});

test('Phase 4083-4088 live battlefield renderers consume depth priority helpers',()=>{
  const enemies=fs.readFileSync('src/game/enemies.ts','utf8');
  const spells=fs.readFileSync('src/game/spells.ts','utf8');
  const game=fs.readFileSync('src/game/game.ts','utf8');
  assert.match(enemies,/projectileBodyOcclusionPresentation/);
  assert.match(game,/bossTelegraphImpactDepthPresentation/);
  assert.match(enemies+game,/safeLaneProjectileCrossingPresentation/);
  assert.match(spells,/heroImpactInteriorRetirementPresentation/);
  assert.match(enemies,/specialistHazardDepthPresentation/);
  assert.match(enemies+spells+game,/battlefieldDepthBudgetPresentation/);
});
