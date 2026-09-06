import test from 'node:test';
import assert from 'node:assert/strict';

import {
  projectileImpactPeakSeparationPresentation,
  bossHazardPeakSeparationPresentation,
  safeLaneBossPeakPriorityPresentation,
  specialistRecoveryTrailPeakPresentation,
  criticalCorridorTemporalReservePresentation,
  crossFamilyPeakBudgetPresentation,
} from '../dist/game/threat-rhythm-peak-separation-rendering.js';

test('Phase 4191 projectile trail and impact interior do not share the same local peak', () => {
  const separated = projectileImpactPeakSeparationPresentation({ trailPeak: 1, impactPeak: 1, proximity: 1, critical: false });
  assert.equal(separated.canonicalScale, 1);
  assert.ok(separated.peakOverlap > .8);
  assert.ok(separated.trailScale < 1 || separated.impactInteriorScale < 1);
  assert.ok(separated.trailScale * separated.impactInteriorScale <= .72);
});

test('Phase 4192 boss edge stays canonical while overlapping hazard interior yields', () => {
  const calm = bossHazardPeakSeparationPresentation({ bossPeak: .2, hazardPeak: .2, overlap: .1, critical: false });
  const dense = bossHazardPeakSeparationPresentation({ bossPeak: 1, hazardPeak: 1, overlap: 1, critical: true });
  assert.equal(dense.bossEdgeScale, 1);
  assert.ok(dense.hazardInteriorScale < calm.hazardInteriorScale);
  assert.ok(dense.hazardInteriorScale >= .34);
});

test('Phase 4193 safe lane owns the crossing without erasing the boss danger edge', () => {
  const p = safeLaneBossPeakPriorityPresentation({ laneConfidence: 1, bossPeak: 1, crossing: 1, critical: true });
  assert.ok(p.safeLaneScale >= 1);
  assert.ok(p.bossEdgeScale >= .78);
  assert.ok(p.bossInteriorScale < p.bossEdgeScale);
});

test('Phase 4194 specialist facing direction wins over recovering trail ornament', () => {
  const p = specialistRecoveryTrailPeakPresentation({ facingPeak: 1, recoveryPeak: 1, stress: .9, critical: true });
  assert.equal(p.specialistDirectionScale, 1);
  assert.ok(p.recoveryTrailScale < .8);
  assert.ok(p.recoveryTrailScale >= .38);
});

test('Phase 4195 critical hero corridor reserves temporal readability', () => {
  const p = criticalCorridorTemporalReservePresentation({ corridorPressure: 1, secondaryPeak: 1, criticalCount: 3, heroProximity: 1 });
  assert.equal(p.corridorScale, 1);
  assert.equal(p.canonicalScale, 1);
  assert.ok(p.secondaryScale <= .6);
  assert.ok(p.reserve > .8);
});

test('Phase 4196 cross-family budget suppresses only secondary rhythmic peaks', () => {
  const calm = crossFamilyPeakBudgetPresentation({ activePeakFamilies: 1, crowd: .1, criticalCount: 0, safeLaneVisible: false, bossActive: false });
  const dense = crossFamilyPeakBudgetPresentation({ activePeakFamilies: 5, crowd: 1, criticalCount: 3, safeLaneVisible: true, bossActive: true });
  assert.equal(dense.canonicalScale, 1);
  assert.ok(dense.secondaryScale < calm.secondaryScale);
  assert.ok(dense.safeLaneScale >= 1);
  assert.ok(dense.bossEdgeScale >= .82);
});

test('Phase 4191-4196 reduced motion/flash never increases secondary rhythmic intensity', () => {
  const normal = crossFamilyPeakBudgetPresentation({ activePeakFamilies: 5, crowd: 1, criticalCount: 2, safeLaneVisible: true, bossActive: true }, false, false);
  const reduced = crossFamilyPeakBudgetPresentation({ activePeakFamilies: 5, crowd: 1, criticalCount: 2, safeLaneVisible: true, bossActive: true }, true, true);
  assert.ok(reduced.secondaryScale <= normal.secondaryScale);
  assert.ok(reduced.safeLaneScale <= normal.safeLaneScale);
  assert.ok(reduced.bossEdgeScale <= normal.bossEdgeScale);
});
