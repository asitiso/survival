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

test('phase 2475 enemy target pressure atlas covers four threat classes x hero core targets', async () => {
  const mod = await importRequired('../src/game/enemy-target-pressure-vfx-assets.ts', '../dist/game/enemy-target-pressure-vfx-assets.js');
  const audit = mod.auditEnemyTargetPressureVfxAtlas();
  assert.deepEqual(mod.ENEMY_TARGET_PRESSURE_VFX_CLASSES, ['regular','specialist','elite','boss']);
  assert.deepEqual(mod.ENEMY_TARGET_PRESSURE_VFX_TARGETS, ['hero','core']);
  assert.equal(audit.classCount, 4);
  assert.equal(audit.targetCount, 2);
  assert.equal(audit.itemCount, 8);
  assert.equal(audit.uniqueCellCount, 8);
  assert.equal(audit.passed, true);
  const buffer = fs.readFileSync(path.resolve(mod.ENEMY_TARGET_PRESSURE_VFX_ATLAS.src.replace(/^\.\//, '')));
  assert.deepEqual(pngDimensions(buffer), { width: 512, height: 256 });
  assert.ok(buffer.length > 6000);
});

test('phase 2476 target pressure classifier separates regular specialist elite and boss', async () => {
  const mod = await importRequired('../src/game/enemy-target-pressure-vfx-assets.ts', '../dist/game/enemy-target-pressure-vfx-assets.js');
  assert.equal(mod.enemyTargetPressureClassForEnemyType('archer'), 'regular');
  assert.equal(mod.enemyTargetPressureClassForEnemyType('shieldbearer'), 'specialist');
  assert.equal(mod.enemyTargetPressureClassForEnemyType('elite'), 'elite');
  assert.equal(mod.enemyTargetPressureClassForEnemyType('boss'), 'boss');
});

test('phase 2477 target pressure marks only reaction-relevant enemies to avoid battlefield clutter', async () => {
  const mod = await importRequired('../src/game/enemy-target-pressure-vfx-assets.ts', '../dist/game/enemy-target-pressure-vfx-assets.js');
  assert.equal(mod.enemyTargetPressureVisible('grunt', 'hero'), false);
  assert.equal(mod.enemyTargetPressureVisible('brute', 'hero'), false);
  assert.equal(mod.enemyTargetPressureVisible('archer', 'hero'), true);
  assert.equal(mod.enemyTargetPressureVisible('bomber', 'hero'), true);
  assert.equal(mod.enemyTargetPressureVisible('grunt', 'core'), true);
  assert.equal(mod.enemyTargetPressureVisible('elite', 'hero'), true);
  assert.equal(mod.enemyTargetPressureVisible('boss', 'core'), true);
});

test('phase 2478 hero and core target states are image-backed while legacy target outline remains fallback', () => {
  assert.match(enemiesSource, /enemyTargetPressureVfxSprite\(enemyTargetPressureClassForEnemyType\(enemy\.type\),enemy\.target\)/);
  assert.match(enemiesSource, /enemyTargetPressureVisible\(enemy\.type,enemy\.target\)/);
  assert.match(enemiesSource, /enemy\.target === 'core' \? '#76dbff' : 'rgba\(18,23,31,\.9\)'/);
});

test('phase 2479 game initializes target pressure atlas without changing action or snapshot contracts', () => {
  assert.match(gameSource, /initializeEnemyTargetPressureVfxAtlas/);
  assert.match(gameSource, /enemyTargetPressureVfxAtlasImage/);
  assert.match(gameSource, /this\.enemies\.renderEnemies\([^\n]*enemyTargetPressureVfxAtlasImage/);
});

test('phase 2480 target pressure audit is deterministic release-bound presentation-only and fail-open', async () => {
  const mod = await importRequired('../src/game/enemy-target-pressure-vfx-audit.ts', '../dist/game/enemy-target-pressure-vfx-audit.js');
  const audit = mod.runEnemyTargetPressureVfxAudit();
  assert.equal(audit.samples.length, 64);
  assert.equal(audit.actionCount, 9);
  assert.equal(audit.presentationOnly, true);
  assert.equal(audit.gameplayFormulaMutation, false);
  assert.equal(audit.snapshotSchemaMutation, false);
  assert.equal(audit.loadFailureBlocksGameplay, false);
  assert.equal(audit.passed, true);
  assert.match(freezeSource, /enemyTargetPressureVfxPassed/);
  assert.match(candidateSource, /enemyTargetPressureVfxPassed/);
  assert.match(candidateSource, /enemy-target-pressure-vfx/);
});
