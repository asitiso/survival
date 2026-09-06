import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as priority from '../dist/game/threat-impact-priority-rendering.js';

const cuePriority = priority.threatCuePriorityArbitrationPresentation;
const overlapBudget = priority.threatOverlapSuppressionBudgetPresentation;
const hazardImpact = priority.hazardImpactEdgeArbitrationPresentation;
const safeLaneGuard = priority.safeLaneOcclusionGuardPresentation;
const silhouette = priority.silhouetteThreatDeconflictionPresentation;
const battlefieldBudget = priority.battlefieldThreatLayerBudgetPresentation;

test('Phase 4065 critical threat ownership never yields to cosmetic pressure', () => {
  const critical = cuePriority?.({threatLevel:1,bossSpecial:true,heroCritical:true,coreCritical:false,safeLaneVisible:true}, false);
  const normal = cuePriority?.({threatLevel:.48,bossSpecial:false,heroCritical:false,coreCritical:false,safeLaneVisible:true}, false);
  assert.ok(critical && normal);
  assert.equal(critical.owner, 'critical');
  assert.equal(critical.primaryAlphaScale, 1);
  assert.ok(critical.secondaryAlphaScale < normal.secondaryAlphaScale);
  assert.ok(critical.safeLaneFloor >= .9);
});

test('Phase 4066 overlap budget retires old decoration but critical cues remain visible', () => {
  const oldNormal = overlapBudget?.({activeCount:10,indexFromNewest:9,kind:'impact',critical:false}, false);
  const oldCritical = overlapBudget?.({activeCount:10,indexFromNewest:9,kind:'impact',critical:true}, false);
  assert.ok(oldNormal && oldCritical);
  assert.equal(oldNormal.visible, false);
  assert.equal(oldCritical.visible, true);
  assert.equal(oldCritical.alphaScale, 1);
});

test('Phase 4067 active hazard edge wins overlap while impact decoration yields', () => {
  const overlap = hazardImpact?.({hazardActive:true,hazardLife:.2,impactLife:.8,overlap:.92}, false);
  const cleared = hazardImpact?.({hazardActive:false,hazardLife:0,impactLife:.8,overlap:.92}, false);
  assert.ok(overlap && cleared);
  assert.ok(overlap.hazardEdgeAlphaScale >= .9);
  assert.ok(overlap.impactAlphaScale < cleared.impactAlphaScale);
  const reducedFlash = hazardImpact?.({hazardActive:true,hazardLife:.2,impactLife:.8,overlap:.92}, true);
  assert.ok(reducedFlash.hazardEdgeAlphaScale >= .9);
});

test('Phase 4068 safe lane keeps a readability floor under dense threat occlusion', () => {
  const dense = safeLaneGuard?.({confidence:.82,hazardPressure:.9,projectilePressure:.88,criticalPressure:.8}, false);
  const calm = safeLaneGuard?.({confidence:.82,hazardPressure:.05,projectilePressure:.05,criticalPressure:0}, false);
  assert.ok(dense && calm);
  assert.ok(dense.safeLaneAlphaScale >= .9);
  assert.ok(dense.safeLaneAlphaScale >= calm.safeLaneAlphaScale);
  assert.ok(dense.hazardDecorationScale < calm.hazardDecorationScale);
});

test('Phase 4069 silhouette deconfliction protects body readability while suppressing decorative trails', () => {
  const dense = silhouette?.({owner:'attack',threatPressure:.92,attackStrength:.84}, false);
  const calm = silhouette?.({owner:'locomotion',threatPressure:.08,attackStrength:.1}, false);
  assert.ok(dense && calm);
  assert.equal(dense.bodyAlphaScale, 1);
  assert.ok(dense.overlayAlphaScale < calm.overlayAlphaScale);
  assert.ok(dense.trailScale < calm.trailScale);
});

test('Phase 4070 unified battlefield budget preserves safe lane and critical layers first', () => {
  const dense = battlefieldBudget?.({projectileCount:12,impactCount:9,hazardCount:6,silhouetteCount:8,criticalCount:2}, false);
  const calm = battlefieldBudget?.({projectileCount:1,impactCount:1,hazardCount:1,silhouetteCount:1,criticalCount:0}, false);
  assert.ok(dense && calm);
  assert.ok(dense.pressure > calm.pressure);
  assert.equal(dense.criticalAlphaScale, 1);
  assert.ok(dense.safeLaneAlphaScale >= 1);
  assert.ok(dense.projectileDecorationScale < calm.projectileDecorationScale);
  assert.ok(dense.impactDecorationScale < calm.impactDecorationScale);
});

test('Phase 4065-4070 live battlefield renderers consume priority helpers', () => {
  const enemies = fs.readFileSync('src/game/enemies.ts', 'utf8');
  const spells = fs.readFileSync('src/game/spells.ts', 'utf8');
  const game = fs.readFileSync('src/game/game.ts', 'utf8');
  assert.match(enemies, /threatCuePriorityArbitrationPresentation/);
  assert.match(enemies, /threatOverlapSuppressionBudgetPresentation/);
  assert.match(spells, /hazardImpactEdgeArbitrationPresentation/);
  assert.match(game, /safeLaneOcclusionGuardPresentation/);
  assert.match(enemies, /silhouetteThreatDeconflictionPresentation/);
  assert.match(enemies + spells + game, /battlefieldThreatLayerBudgetPresentation/);
});
