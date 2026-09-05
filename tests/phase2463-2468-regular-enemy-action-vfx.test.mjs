import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const enemiesSource = fs.readFileSync(new URL('../src/game/enemies.ts', import.meta.url), 'utf8');
const gameSource = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
const freezeSource = fs.readFileSync(new URL('../src/game/release-freeze-audit.ts', import.meta.url), 'utf8');
const candidateSource = fs.readFileSync(new URL('../src/game/release-candidate-audit.ts', import.meta.url), 'utf8');

function pngDimensions(buffer) {
  assert.equal(buffer.toString('ascii', 1, 4), 'PNG');
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

async function importRequired(sourceRelative, distRelative) {
  assert.equal(fs.existsSync(new URL(sourceRelative, import.meta.url)), true, `${sourceRelative} must exist`);
  return import(distRelative);
}

test('phase 2463 regular enemy action atlas covers archer bomber shaman telegraph and resolve', async () => {
  const mod = await importRequired('../src/game/regular-enemy-action-vfx-assets.ts', '../dist/game/regular-enemy-action-vfx-assets.js');
  const audit = mod.auditRegularEnemyActionVfxAtlas();
  assert.deepEqual(mod.REGULAR_ENEMY_ACTION_VFX_KINDS, ['archer','bomber','shaman']);
  assert.deepEqual(mod.REGULAR_ENEMY_ACTION_VFX_STATES, ['telegraph','resolve']);
  assert.equal(audit.kindCount, 3);
  assert.equal(audit.stateCount, 2);
  assert.equal(audit.itemCount, 6);
  assert.equal(audit.uniqueCellCount, 6);
  assert.equal(audit.coverage, 1);
  assert.equal(audit.passed, true);
  const buffer = fs.readFileSync(path.resolve(mod.REGULAR_ENEMY_ACTION_VFX_ATLAS.src.replace(/^\.\//, '')));
  assert.deepEqual(pngDimensions(buffer), { width: 384, height: 256 });
  assert.ok(buffer.length > 5000);
});

test('phase 2464 archer gains pre-shot and release identity without changing projectile damage', () => {
  assert.match(enemiesSource, /regularEnemyActionVfxSprite\('archer','telegraph'\)/);
  assert.match(enemiesSource, /queueRegularEnemyActionVfx\('archer','resolve'/);
  assert.match(enemiesSource, /damage: enemy\.damage,/);
  assert.match(enemiesSource, /vel: \{ x: dir\.x \* 260 \* this\.endlessProjectileSpeedMultiplier/);
});

test('phase 2465 bomber gains fuse and detonation identity while blast contract stays fixed', () => {
  assert.match(enemiesSource, /regularEnemyActionVfxSprite\('bomber','telegraph'\)/);
  assert.match(enemiesSource, /queueRegularEnemyActionVfx\('bomber','resolve'/);
  assert.match(enemiesSource, /SPECIALIST_COMBAT_CONTRACT\.bomberBlastRadius/);
  assert.match(enemiesSource, /ctx\.onHeroDamage\(enemy\.damage, 'explosion'\)/);
});

test('phase 2466 shaman gains cast and heal-pulse identity while heal math stays fixed', () => {
  assert.match(enemiesSource, /regularEnemyActionVfxSprite\('shaman','telegraph'\)/);
  assert.match(enemiesSource, /queueRegularEnemyActionVfx\('shaman','resolve'/);
  assert.match(enemiesSource, /SPECIALIST_COMBAT_CONTRACT\.shamanHealMinimum/);
  assert.match(enemiesSource, /SPECIALIST_COMBAT_CONTRACT\.shamanHealRatio/);
});

test('phase 2467 game initializes regular action atlas and supplies it only to enemy rendering', () => {
  assert.match(gameSource, /initializeRegularEnemyActionVfxAtlas/);
  assert.match(gameSource, /regularEnemyActionVfxAtlasImage/);
  assert.match(gameSource, /this\.enemies\.renderEnemies\([^\n]*regularEnemyActionVfxAtlasImage/);
});

test('phase 2468 regular enemy action audit is deterministic release-bound and presentation-only', async () => {
  const mod = await importRequired('../src/game/regular-enemy-action-vfx-audit.ts', '../dist/game/regular-enemy-action-vfx-audit.js');
  const audit = mod.runRegularEnemyActionVfxAudit();
  assert.equal(audit.samples.length, 64);
  assert.equal(audit.actionCount, 9);
  assert.equal(audit.presentationOnly, true);
  assert.equal(audit.gameplayFormulaMutation, false);
  assert.equal(audit.snapshotSchemaMutation, false);
  assert.equal(audit.loadFailureBlocksGameplay, false);
  assert.equal(audit.passed, true);
  assert.match(freezeSource, /regularEnemyActionVfxPassed/);
  assert.match(freezeSource, /regularEnemyActionVfxSamples/);
  assert.match(candidateSource, /regularEnemyActionVfxPassed/);
  assert.match(candidateSource, /regular-enemy-action-vfx/);
});
