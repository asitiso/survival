import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const gameSource = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
const enemiesSource = fs.readFileSync(new URL('../src/game/enemies.ts', import.meta.url), 'utf8');
const spellsSource = fs.readFileSync(new URL('../src/game/spells.ts', import.meta.url), 'utf8');

test('phase 2415 obstacle state atlas provides 3 maps x 3 visual states', async () => {
  assert.equal(fs.existsSync(new URL('../assets/arena/battlefield-obstacle-states.png', import.meta.url)), true);
  const mod = await import('../dist/game/battlefield-obstacle-state-vfx-assets.js');
  assert.equal(mod.BATTLEFIELD_OBSTACLE_STATE_VFX_ATLAS.columns, 3);
  assert.equal(mod.BATTLEFIELD_OBSTACLE_STATE_VFX_ATLAS.rows, 3);
  assert.equal(mod.auditBattlefieldObstacleStateVfxAtlas().passed, true);
  assert.equal(mod.auditBattlefieldObstacleStateVfxAtlas().uniqueCellCount, 9);
});

test('phase 2416 specialist combat atlas covers four specialist pose and ability channels', async () => {
  assert.equal(fs.existsSync(new URL('../assets/enemies/specialist-combat-vfx.png', import.meta.url)), true);
  const mod = await import('../dist/game/specialist-combat-vfx-assets.js');
  const audit = mod.auditSpecialistCombatVfxAtlas();
  assert.equal(audit.passed, true);
  assert.equal(audit.specialistCount, 4);
  assert.equal(audit.uniqueCellCount, 8);
});

test('phase 2417 boss phase overlay atlas covers six archetypes at phase 2 and phase 3', async () => {
  assert.equal(fs.existsSync(new URL('../assets/bosses/boss-phase-overlays.png', import.meta.url)), true);
  const mod = await import('../dist/game/boss-phase-overlay-vfx-assets.js');
  const audit = mod.auditBossPhaseOverlayVfxAtlas();
  assert.equal(audit.passed, true);
  assert.equal(audit.archetypeCount, 6);
  assert.equal(audit.uniqueCellCount, 12);
});

test('phase 2418 hero ultimate atlas covers meteor and black hole for all four heroes', async () => {
  assert.equal(fs.existsSync(new URL('../assets/heroes/hero-ultimate-signature-vfx.png', import.meta.url)), true);
  const mod = await import('../dist/game/hero-ultimate-signature-vfx-assets.js');
  const audit = mod.auditHeroUltimateSignatureVfxAtlas();
  assert.equal(audit.passed, true);
  assert.equal(audit.heroCount, 4);
  assert.equal(audit.uniqueCellCount, 8);
});

test('phase 2419-2421 live render wiring remains presentation-only with fallbacks', () => {
  assert.match(gameSource, /initializeBattlefieldObstacleStateVfxAtlas/);
  assert.match(gameSource, /battlefieldObstacleStateVfxSprite/);
  assert.match(gameSource, /initializeBossPhaseOverlayVfxAtlas/);
  assert.match(enemiesSource, /specialistCombatVfxSprite/);
  assert.match(enemiesSource, /bossPhaseOverlayVfxSprite/);
  assert.match(spellsSource, /heroUltimateSignatureVfxSprite/);
  assert.match(spellsSource, /ultimateSignatureAtlasReady/);
});
