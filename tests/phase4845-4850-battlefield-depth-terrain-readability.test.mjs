import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const presentationModule = await import('../dist/game/battlefield-depth-terrain-readability.js').catch(() => null);

function api() {
  assert.ok(presentationModule, 'battlefield depth / terrain readability module must exist');
  return presentationModule;
}

const calm = {
  battlefieldStress: 0,
  evolutionStage: 0,
  reducedMotion: false,
  reducedFlash: false,
};

test('phase 4845 ground depth keeps center quiet while strengthening the outer battlefield frame', () => {
  const { battlefieldDepthTerrainPresentation } = api();
  const view = battlefieldDepthTerrainPresentation(calm);
  assert.ok(view.ground.edgeAlpha > view.ground.centerAlpha);
  assert.ok(view.ground.edgeAlpha <= 0.22);
  assert.ok(view.ground.centerAlpha <= 0.10);
  assert.ok(view.ground.radiusScale >= 0.72 && view.ground.radiusScale <= 0.90);
});

test('phase 4846 obstacle material presence preserves contact shadow and collision edge readability', () => {
  const { battlefieldDepthTerrainPresentation } = api();
  const calmView = battlefieldDepthTerrainPresentation(calm);
  const denseView = battlefieldDepthTerrainPresentation({ ...calm, battlefieldStress: 1 });
  assert.ok(calmView.obstacle.contactShadowAlpha >= 0.20);
  assert.ok(calmView.obstacle.edgeAlpha >= 0.18);
  assert.ok(denseView.obstacle.contactShadowAlpha >= calmView.obstacle.contactShadowAlpha * 0.70);
  assert.ok(denseView.obstacle.edgeAlpha >= calmView.obstacle.edgeAlpha * 0.70);
  assert.ok(calmView.obstacle.shadowOffsetY >= 8 && calmView.obstacle.shadowOffsetY <= 18);
});

test('phase 4847 approach lane rhythm stays subordinate to obstacle and core anchors', () => {
  const { battlefieldDepthTerrainPresentation } = api();
  const view = battlefieldDepthTerrainPresentation(calm);
  assert.ok(view.lane.alpha > 0);
  assert.ok(view.lane.alpha < view.obstacle.edgeAlpha);
  assert.ok(view.lane.alpha < view.core.foundationAlpha);
  assert.ok(view.lane.segmentLength >= 38 && view.lane.segmentLength <= 72);
  assert.ok(view.lane.gapLength >= 24 && view.lane.gapLength <= 56);
  assert.ok(view.lane.pulseAmplitude > 0 && view.lane.pulseAmplitude <= 0.05);
});

test('phase 4848 guardian core terrain anchor remains readable without competing with combat warnings', () => {
  const { battlefieldDepthTerrainPresentation } = api();
  const view = battlefieldDepthTerrainPresentation(calm);
  assert.ok(view.core.foundationAlpha >= 0.18 && view.core.foundationAlpha <= 0.34);
  assert.ok(view.core.ringAlpha > 0 && view.core.ringAlpha <= 0.18);
  assert.ok(view.core.foundationRadius >= 105 && view.core.foundationRadius <= 145);
  assert.ok(view.core.ringRadius > view.core.foundationRadius);
  assert.ok(view.core.pulseAmplitude <= 0.04);
});

test('phase 4849 dense combat suppresses decorative terrain while preserving obstacle and core location', () => {
  const { battlefieldDepthTerrainPresentation } = api();
  const calmView = battlefieldDepthTerrainPresentation(calm);
  const denseView = battlefieldDepthTerrainPresentation({ ...calm, battlefieldStress: 1 });
  const overDenseView = battlefieldDepthTerrainPresentation({ ...calm, battlefieldStress: 99 });
  const belowCalmView = battlefieldDepthTerrainPresentation({ ...calm, battlefieldStress: -5 });
  assert.ok(denseView.ground.edgeAlpha <= calmView.ground.edgeAlpha * 0.50 + 1e-6);
  assert.ok(denseView.lane.alpha <= calmView.lane.alpha * 0.50 + 1e-6);
  assert.ok(denseView.obstacle.edgeAlpha >= calmView.obstacle.edgeAlpha * 0.70);
  assert.ok(denseView.core.foundationAlpha >= calmView.core.foundationAlpha * 0.70);
  assert.equal(overDenseView.ground.edgeAlpha, denseView.ground.edgeAlpha);
  assert.equal(overDenseView.core.foundationAlpha, denseView.core.foundationAlpha);
  assert.equal(belowCalmView.ground.edgeAlpha, calmView.ground.edgeAlpha);
});

test('phase 4850 accessibility removes environmental pulse and live integration stays presentation-only', () => {
  const { battlefieldDepthTerrainPresentation } = api();
  const full = battlefieldDepthTerrainPresentation({ ...calm, evolutionStage: 2 });
  const accessible = battlefieldDepthTerrainPresentation({
    ...calm,
    evolutionStage: 2,
    reducedMotion: true,
    reducedFlash: true,
  });
  assert.equal(accessible.lane.pulseAmplitude, 0);
  assert.equal(accessible.core.pulseAmplitude, 0);
  assert.ok(accessible.ground.edgeAlpha <= full.ground.edgeAlpha);
  assert.ok(accessible.lane.alpha <= full.lane.alpha);
  assert.ok(accessible.core.ringAlpha <= full.core.ringAlpha);

  const terrainSource = readFileSync(new URL('../src/game/terrain.ts', import.meta.url), 'utf8');
  const gameSource = readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
  assert.match(terrainSource, /render\(ctx: CanvasRenderingContext2D, motion\?: ResidualCombatMotionPolicy, readability\?: BattlefieldDepthTerrainPresentation\)/);
  assert.match(terrainSource, /contactShadowAlpha/);
  assert.match(gameSource, /battlefieldDepthTerrainPresentation/);
  assert.match(gameSource, /drawBattlefieldTerrainReadability/);
  assert.match(gameSource, /foundationRadius/);
  const renderIndex = terrainSource.indexOf('render(ctx: CanvasRenderingContext2D');
  assert.ok(renderIndex > 0);
  const gameplayCollisionSlice = terrainSource.slice(0, renderIndex);
  assert.doesNotMatch(gameplayCollisionSlice, /contactShadowAlpha|foundationRadius|ringRadius/);
  assert.doesNotMatch(gameSource, /this\.(hero|core)\.(pos|radius)\s*=.*battlefieldDepthTerrainPresentation/);
});
