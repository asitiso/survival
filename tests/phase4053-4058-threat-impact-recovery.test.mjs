import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as recovery from '../dist/game/threat-impact-recovery-rendering.js';

const direction = recovery.projectileDirectionCarryRecoveryPresentation;
const arrival = recovery.projectileArrivalSettleRecoveryPresentation;
const residue = recovery.hazardResidueReleasePresentation;
const reclaim = recovery.safeLaneHazardReclaimPresentation;
const silhouette = recovery.silhouetteRecoveryReentryPresentation;
const budget = recovery.continuityCrowdBudgetPresentation;

test('Phase 4053 travel owner keeps directional tail after launch handoff', () => {
  const launch = direction?.({ owner:'launch', speed:360, life:.9 }, false, false);
  const travel = direction?.({ owner:'travel', speed:360, life:.72 }, false, false);
  assert.ok(launch && travel);
  assert.ok(travel.tailAlphaScale >= .55);
  assert.ok(travel.tailLengthScale >= launch.tailLengthScale * .72);
  assert.equal(travel.owner, 'travel');
});

test('Phase 4054 arrival settle retires direction before footprint', () => {
  const early = arrival?.({ impactLife:.82, reaction:'hit' }, false);
  const late = arrival?.({ impactLife:.16, reaction:'hit' }, false);
  assert.ok(early && late);
  assert.ok(late.directionAlphaScale < early.directionAlphaScale);
  assert.ok(late.footprintAlphaScale > late.directionAlphaScale);
});

test('Phase 4055 hazard release hands fading edge to cleared-ground residue', () => {
  const active = residue?.({ ttl:2.4, maxTtl:5.4, clearedMemoryLife:0 }, false);
  const ending = residue?.({ ttl:.34, maxTtl:5.4, clearedMemoryLife:.18 }, false);
  assert.ok(active && ending);
  assert.equal(active.owner, 'hazard');
  assert.equal(ending.owner, 'residue');
  assert.ok(ending.clearedGroundAlphaScale > active.clearedGroundAlphaScale);
  assert.ok(ending.hazardEdgeScale < active.hazardEdgeScale);
});

test('Phase 4056 safe lane reclaims contrast when hazards are expiring or cleared', () => {
  const blocked = reclaim?.({ expiringHazardCount:0, clearedMemoryCount:0, occlusion:.72 }, false, false);
  const released = reclaim?.({ expiringHazardCount:2, clearedMemoryCount:2, occlusion:.2 }, false, false);
  assert.ok(blocked && released);
  assert.ok(released.safeLaneAlphaScale > blocked.safeLaneAlphaScale);
  assert.equal(blocked.hazardAlphaScale, 1);
  assert.ok(released.hazardAlphaScale < 1);
});

test('Phase 4057 recovery silhouette moves ownership back toward locomotion', () => {
  const attack = silhouette?.({ owner:'attack', recovery:.08, motionBlend:.72, turn:.2 }, false);
  const recoveryState = silhouette?.({ owner:'recovery', recovery:.72, motionBlend:.72, turn:.2 }, false);
  assert.ok(attack && recoveryState);
  const locomotion = silhouette?.({ owner:'locomotion', recovery:1, motionBlend:.72, turn:.2 }, false);
  assert.ok(recoveryState.locomotionWeight > attack.locomotionWeight);
  assert.ok(recoveryState.trailDistanceScale < attack.trailDistanceScale);
  assert.equal(locomotion?.trailDistanceScale, 1);
  assert.equal(locomotion?.alphaScale, 1);
});

test('Phase 4058 crowd budget retires old transition decoration but preserves canonical readability', () => {
  const newest = budget?.({ activeCount:9, indexFromNewest:0, owner:'silhouette' }, false);
  const old = budget?.({ activeCount:9, indexFromNewest:8, owner:'silhouette' }, false);
  assert.ok(newest && old);
  assert.ok(newest.effectStrength > old.effectStrength);
  assert.equal(old.bodyAlphaScale, 1);
  assert.equal(old.safeLaneAlphaScale, 1);
});

test('Phase 4053-4058 live renderers consume recovery continuity helpers', () => {
  const enemies = fs.readFileSync('src/game/enemies.ts', 'utf8');
  const spells = fs.readFileSync('src/game/spells.ts', 'utf8');
  const game = fs.readFileSync('src/game/game.ts', 'utf8');
  assert.match(enemies, /projectileDirectionCarryRecoveryPresentation/);
  assert.match(enemies, /silhouetteRecoveryReentryPresentation/);
  assert.match(spells, /projectileArrivalSettleRecoveryPresentation/);
  assert.match(game, /hazardResidueReleasePresentation/);
  assert.match(game, /safeLaneHazardReclaimPresentation/);
  assert.match(enemies, /continuityCrowdBudgetPresentation/);
});
