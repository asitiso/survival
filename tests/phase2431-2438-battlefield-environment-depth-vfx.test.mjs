import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const gameSource = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
const enemiesSource = fs.readFileSync(new URL('../src/game/enemies.ts', import.meta.url), 'utf8');
const freezeSource = fs.readFileSync(new URL('../src/game/release-freeze-audit.ts', import.meta.url), 'utf8');
const candidateSource = fs.readFileSync(new URL('../src/game/release-candidate-audit.ts', import.meta.url), 'utf8');

test('phase 2431 atmosphere atlas covers 3 maps x 3 evolution stages', async () => {
  const sourceUrl = new URL('../src/game/battlefield-atmosphere-vfx-assets.ts', import.meta.url);
  const assetUrl = new URL('../assets/arena/battlefield-atmosphere-vfx.png', import.meta.url);
  assert.equal(fs.existsSync(sourceUrl), true);
  assert.equal(fs.existsSync(assetUrl), true);
  if (!fs.existsSync(sourceUrl) || !fs.existsSync(assetUrl)) return;
  const mod = await import('../dist/game/battlefield-atmosphere-vfx-assets.js');
  const audit = mod.auditBattlefieldAtmosphereVfxAtlas();
  assert.equal(audit.itemCount, 9);
  assert.equal(audit.uniqueCellCount, 9);
  assert.equal(audit.coverage, 1);
  assert.deepEqual(audit.outOfBounds, []);
  assert.equal(audit.passed, true);
});

test('phase 2432 arena draws atmosphere between background and battlefield actors with reduced-motion static policy', () => {
  assert.match(gameSource, /initializeBattlefieldAtmosphereVfxAtlas/);
  assert.match(gameSource, /drawBattlefieldAtmosphereVfx/);
  assert.match(gameSource, /battlefieldAtmosphereVfxSprite/);
  assert.match(gameSource, /this\.presentationSettings\.reducedMotion/);
  assert.match(gameSource, /this\.drawArena\(ctx\);[\s\S]*this\.drawBattlefieldAtmosphereVfx\(ctx/);
});

test('phase 2433 reaction atlas covers six terrain reactions plus archer projectile and impact', async () => {
  const sourceUrl = new URL('../src/game/battlefield-environment-reaction-vfx-assets.ts', import.meta.url);
  const assetUrl = new URL('../assets/arena/battlefield-environment-reaction-vfx.png', import.meta.url);
  assert.equal(fs.existsSync(sourceUrl), true);
  assert.equal(fs.existsSync(assetUrl), true);
  if (!fs.existsSync(sourceUrl) || !fs.existsSync(assetUrl)) return;
  const mod = await import('../dist/game/battlefield-environment-reaction-vfx-assets.js');
  const audit = mod.auditBattlefieldEnvironmentReactionVfxAtlas();
  assert.equal(audit.itemCount, 8);
  assert.equal(audit.uniqueCellCount, 8);
  assert.equal(audit.terrainReactionCount, 6);
  assert.equal(audit.archerCueCount, 2);
  assert.deepEqual(audit.outOfBounds, []);
  assert.equal(audit.passed, true);
});

test('phase 2434-2436 map evolution and crystal blast queue image reactions without replacing existing canvas feedback', () => {
  assert.match(gameSource, /queueBattlefieldEnvironmentReactionVfx/);
  assert.match(gameSource, /'evolutionCollapse'/);
  assert.match(gameSource, /'crystalBlast'/);
  assert.match(gameSource, /drawBattlefieldEnvironmentReactionVfx/);
  assert.match(gameSource, /this\.presentation\.emitScreenEffect/);
});

test('phase 2437 archer projectile keeps gameplay projectile contract while adding projectile and impact image cues', () => {
  assert.match(enemiesSource, /sourceType\?: EnemyType/);
  assert.match(enemiesSource, /sourceType: enemy\.type/);
  assert.match(enemiesSource, /archerProjectileImpactVfx/);
  assert.match(enemiesSource, /battlefieldEnvironmentReactionVfxSprite\('archerProjectile'/);
  assert.match(enemiesSource, /battlefieldEnvironmentReactionVfxSprite\('archerImpact'/);
});

test('phase 2438 deterministic audit and release candidate bind environment depth vfx fail-closed', async () => {
  const auditUrl = new URL('../src/game/battlefield-environment-depth-vfx-audit.ts', import.meta.url);
  assert.equal(fs.existsSync(auditUrl), true);
  if (!fs.existsSync(auditUrl)) return;
  const mod = await import('../dist/game/battlefield-environment-depth-vfx-audit.js');
  const audit = mod.runBattlefieldEnvironmentDepthVfxAudit();
  assert.equal(audit.passed, true);
  assert.equal(audit.samples.length, 64);
  assert.equal(audit.gameplayFormulaMutation, false);
  assert.equal(audit.snapshotSchemaMutation, false);
  assert.match(freezeSource, /battlefieldEnvironmentDepthVfxPassed/);
  assert.match(freezeSource, /battlefieldEnvironmentDepthVfxSamples/);
  assert.match(candidateSource, /battlefieldEnvironmentDepthVfxPassed/);
  assert.match(candidateSource, /battlefieldEnvironmentDepthVfxSamples/);
});
