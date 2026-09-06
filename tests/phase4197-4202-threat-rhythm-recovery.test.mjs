import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  projectileTrailRhythmRecoveryPresentation,
  impactRhythmRecoveryPresentation,
  bossHazardRhythmRecoveryPresentation,
  safeLaneRhythmRecoveryPresentation,
  specialistRhythmRecoveryPresentation,
  rhythmRecoveryBudgetPresentation,
} from '../dist/game/threat-rhythm-recovery-rendering.js';

test('Phase 4197 projectile trail recovers monotonically without snapping to full peak',()=>{
  const early=projectileTrailRhythmRecoveryPresentation({suppression:1,release:.15,stress:.9,critical:false});
  const late=projectileTrailRhythmRecoveryPresentation({suppression:1,release:.85,stress:.3,critical:false});
  assert.equal(early.canonicalScale,1);
  assert.ok(early.secondaryScale<late.secondaryScale);
  assert.ok(early.secondaryScale<.72);
  assert.ok(late.secondaryScale<1);
});

test('Phase 4198 impact interior recovers after canonical edge ownership',()=>{
  const held=impactRhythmRecoveryPresentation({suppression:1,release:.1,stress:1,critical:true});
  const released=impactRhythmRecoveryPresentation({suppression:.35,release:.9,stress:.2,critical:true});
  assert.equal(held.edgeScale,1);
  assert.equal(released.edgeScale,1);
  assert.ok(held.interiorScale<released.interiorScale);
});

test('Phase 4199 boss hazard interior cannot outrun danger edge during recovery',()=>{
  const p=bossHazardRhythmRecoveryPresentation({suppression:.9,release:.35,stress:.9,critical:true});
  assert.equal(p.bossEdgeScale,1);
  assert.ok(p.hazardInteriorScale<p.bossEdgeScale);
  assert.ok(p.hazardInteriorScale>=.36);
});

test('Phase 4200 safe lane remains primary while decorative rhythm comes back gradually',()=>{
  const early=safeLaneRhythmRecoveryPresentation({suppression:1,release:.2,stress:.8,confidence:1,critical:true});
  const late=safeLaneRhythmRecoveryPresentation({suppression:.3,release:.9,stress:.2,confidence:1,critical:true});
  assert.ok(early.safeLaneScale>=1);
  assert.ok(early.decorationScale<late.decorationScale);
  assert.ok(late.decorationScale<=1);
});

test('Phase 4201 specialist silhouette stays canonical while recovery trail returns',()=>{
  const early=specialistRhythmRecoveryPresentation({suppression:1,release:.2,stress:.9,critical:true});
  const late=specialistRhythmRecoveryPresentation({suppression:.2,release:.9,stress:.2,critical:true});
  assert.equal(early.silhouetteScale,1);
  assert.ok(early.trailScale<late.trailScale);
  assert.ok(early.trailScale>=.4);
});

test('Phase 4202 recovery budget limits simultaneous family rebound',()=>{
  const calm=rhythmRecoveryBudgetPresentation({recoveringFamilies:1,stress:.15,criticalCount:0,safeLaneVisible:false,bossActive:false});
  const dense=rhythmRecoveryBudgetPresentation({recoveringFamilies:5,stress:1,criticalCount:3,safeLaneVisible:true,bossActive:true});
  assert.equal(dense.canonicalScale,1);
  assert.ok(dense.secondaryScale<calm.secondaryScale);
  assert.ok(dense.safeLaneScale>=1);
  assert.ok(dense.bossEdgeScale>=.84);
});

test('Phase 4197-4202 reduced motion/flash cannot increase rebound intensity',()=>{
  const normal=rhythmRecoveryBudgetPresentation({recoveringFamilies:5,stress:1,criticalCount:2,safeLaneVisible:true,bossActive:true},false,false);
  const reduced=rhythmRecoveryBudgetPresentation({recoveringFamilies:5,stress:1,criticalCount:2,safeLaneVisible:true,bossActive:true},true,true);
  assert.ok(reduced.secondaryScale<=normal.secondaryScale);
  assert.ok(reduced.safeLaneScale<=normal.safeLaneScale);
  assert.ok(reduced.bossEdgeScale<=normal.bossEdgeScale);
});

test('Phase 4197-4202 live renderers consume rhythm recovery',()=>{
  const e=fs.readFileSync(new URL('../src/game/enemies.ts',import.meta.url),'utf8');
  const s=fs.readFileSync(new URL('../src/game/spells.ts',import.meta.url),'utf8');
  const g=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(e,/projectileTrailRhythmRecoveryPresentation/);
  assert.match(e,/specialistRhythmRecoveryPresentation/);
  assert.match(s,/impactRhythmRecoveryPresentation/);
  assert.match(g,/bossHazardRhythmRecoveryPresentation/);
  assert.match(g,/safeLaneRhythmRecoveryPresentation/);
  assert.match(g,/rhythmRecoveryBudgetPresentation/);
});
