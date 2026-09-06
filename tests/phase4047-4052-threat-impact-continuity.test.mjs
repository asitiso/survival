import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as continuity from '../dist/game/threat-impact-continuity-rendering.js';

const launch = continuity.threatLaunchOwnershipPresentation;
const travel = continuity.projectileTravelThreatCarryPresentation;
const arrival = continuity.impactArrivalFootprintContinuityPresentation;
const reaction = continuity.impactReactionCarryPresentation;
const expiry = continuity.hazardExpiryEdgeContinuityPresentation;
const lane = continuity.denseBattleSafeLaneContinuityPresentation;

test('Phase 4047 threat launch ownership keeps launch cue strongest at release', () => {
  const early = launch?.({ launchLife: 1, travelLife: 1, threat: 1 }, false);
  const late = launch?.({ launchLife: 0.08, travelLife: 0.72, threat: 1 }, false);
  assert.ok(early && late);
  assert.equal(early.owner, 'launch');
  assert.equal(late.owner, 'travel');
  assert.ok(early.launchAlphaScale > late.launchAlphaScale);
});

test('Phase 4048 projectile travel carry preserves direction after launch cue releases', () => {
  const p = travel?.({ speed: 420, launchLife: 0, travelLife: 0.72, radius: 10 }, false, false);
  assert.ok(p);
  assert.equal(p.visible, true);
  assert.ok(p.alphaScale >= 0.45);
  assert.ok(p.lengthScale >= 0.7);
});

test('Phase 4049 impact arrival footprint trades fill for readable edge as it settles', () => {
  const fresh = arrival?.({ life: 1, response: 'death', secondary: false }, false);
  const settled = arrival?.({ life: 0.18, response: 'death', secondary: false }, false);
  assert.ok(fresh && settled);
  assert.ok(fresh.fillAlphaScale > settled.fillAlphaScale);
  assert.ok(settled.edgeAlphaScale >= fresh.edgeAlphaScale * 0.65);
  assert.ok(settled.radiusScale >= 1);
});

test('Phase 4050 death reaction keeps more aftermath carry than ordinary hit', () => {
  const death = reaction?.({ life: 0.42, reaction: 'death', response: 'canonical' }, false);
  const hit = reaction?.({ life: 0.42, reaction: 'hit', response: 'canonical' }, false);
  assert.ok(death && hit);
  assert.ok(death.aftermathAlphaScale > hit.aftermathAlphaScale);
  assert.ok(death.spriteAlphaScale <= hit.spriteAlphaScale);
});

test('Phase 4051 expiring hazard dims fill before edge so footprint boundary remains legible', () => {
  const active = expiry?.({ ttl: 3.6, maxTtl: 5.4, telegraph: 0 }, false);
  const ending = expiry?.({ ttl: 0.45, maxTtl: 5.4, telegraph: 0 }, false);
  assert.ok(active && ending);
  assert.equal(active.owner, 'active');
  assert.equal(ending.owner, 'expiry');
  assert.ok(ending.fillAlphaScale < active.fillAlphaScale);
  assert.ok(ending.edgeAlphaScale > ending.fillAlphaScale);
});

test('Phase 4052 dense battle preserves safe lane while reducing hazard fill competition', () => {
  const sparse = lane?.({ hazardCount: 2, projectileCount: 2, bossSpecial: false }, false, false);
  const dense = lane?.({ hazardCount: 7, projectileCount: 14, bossSpecial: true }, false, false);
  assert.ok(sparse && dense);
  assert.ok(dense.safeLaneAlphaScale >= sparse.safeLaneAlphaScale);
  assert.ok(dense.hazardFillScale < sparse.hazardFillScale);
  assert.equal(dense.hazardEdgeScale, 1);
});

test('Phase 4047-4052 live renderers consume threat-impact continuity helpers', () => {
  const enemies = fs.readFileSync('src/game/enemies.ts', 'utf8');
  const spells = fs.readFileSync('src/game/spells.ts', 'utf8');
  const game = fs.readFileSync('src/game/game.ts', 'utf8');
  assert.match(enemies, /threatLaunchOwnershipPresentation/);
  assert.match(enemies, /projectileTravelThreatCarryPresentation/);
  assert.match(spells, /impactArrivalFootprintContinuityPresentation/);
  assert.match(spells, /impactReactionCarryPresentation/);
  assert.match(game, /hazardExpiryEdgeContinuityPresentation/);
  assert.match(game, /denseBattleSafeLaneContinuityPresentation/);
});
