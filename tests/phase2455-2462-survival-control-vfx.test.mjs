import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const gameSource = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
const enemiesSource = fs.readFileSync(new URL('../src/game/enemies.ts', import.meta.url), 'utf8');
const freezeSource = fs.readFileSync(new URL('../src/game/release-freeze-audit.ts', import.meta.url), 'utf8');
const candidateSource = fs.readFileSync(new URL('../src/game/release-candidate-audit.ts', import.meta.url), 'utf8');

function pngDimensions(buffer) {
  assert.equal(buffer.toString('ascii', 1, 4), 'PNG');
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

async function importRequired(sourceRelative, distRelative) {
  const sourceUrl = new URL(sourceRelative, import.meta.url);
  assert.equal(fs.existsSync(sourceUrl), true, `${sourceRelative} must exist`);
  return import(distRelative);
}

test('phase 2455 survival response atlas covers six unique hero/core response states', async () => {
  const mod = await importRequired('../src/game/survival-response-vfx-assets.ts', '../dist/game/survival-response-vfx-assets.js');
  const audit = mod.auditSurvivalResponseVfxAtlas();
  assert.equal(audit.itemCount, 6);
  assert.equal(audit.uniqueCellCount, 6);
  assert.equal(audit.coverage, 1);
  assert.deepEqual(audit.outOfBounds, []);
  assert.equal(audit.passed, true);
  assert.deepEqual(mod.SURVIVAL_RESPONSE_VFX_KINDS, ['heroPotion','heroPotionBoost','heroGuard','coreHit','coreRecover','coreGuard']);
  const buffer = fs.readFileSync(path.resolve(mod.SURVIVAL_RESPONSE_VFX_ATLAS.src.replace(/^\.\//, '')));
  assert.deepEqual(pngDimensions(buffer), { width: 384, height: 256 });
  assert.ok(buffer.length > 5000);
});

test('phase 2456-2458 game queues potion guard core-hit and core-recovery feedback without changing gameplay formulas', () => {
  assert.match(gameSource, /queueSurvivalResponseVfx\('heroPotionBoost'/);
  assert.match(gameSource, /queueSurvivalResponseVfx\('heroPotion'/);
  assert.match(gameSource, /queueSurvivalResponseVfx\('heroGuard'/);
  assert.match(gameSource, /queueSurvivalResponseVfx\('coreHit'/);
  assert.match(gameSource, /queueSurvivalResponseVfx\('coreGuard'/);
  assert.match(gameSource, /queueSurvivalResponseVfx\('coreRecover'/);
  assert.match(gameSource, /this\.hero\.maxHp \* 0\.35 \* efficiency/);
  assert.match(gameSource, /amount \* this\.hero\.equipmentDamageTakenMultiplier \* this\.runHeroDamageTakenMultiplier \* auraMultiplier/);
  assert.match(gameSource, /amount \* this\.hero\.equipmentCoreDamageTakenMultiplier \* this\.runCoreDamageTakenMultiplier/);
});

test('phase 2459 freeze control atlas covers regular specialist elite boss active and shatter states', async () => {
  const mod = await importRequired('../src/game/freeze-control-vfx-assets.ts', '../dist/game/freeze-control-vfx-assets.js');
  const audit = mod.auditFreezeControlVfxAtlas();
  assert.equal(audit.classCount, 4);
  assert.equal(audit.stateCount, 2);
  assert.equal(audit.itemCount, 8);
  assert.equal(audit.uniqueCellCount, 8);
  assert.equal(audit.coverage, 1);
  assert.deepEqual(audit.outOfBounds, []);
  assert.equal(audit.passed, true);
  assert.equal(mod.freezeControlVfxClassForEnemyType('grunt'), 'regular');
  assert.equal(mod.freezeControlVfxClassForEnemyType('shieldbearer'), 'specialist');
  assert.equal(mod.freezeControlVfxClassForEnemyType('elite'), 'elite');
  assert.equal(mod.freezeControlVfxClassForEnemyType('boss'), 'boss');
  const buffer = fs.readFileSync(path.resolve(mod.FREEZE_CONTROL_VFX_ATLAS.src.replace(/^\.\//, '')));
  assert.deepEqual(pngDimensions(buffer), { width: 512, height: 256 });
  assert.ok(buffer.length > 5000);
});

test('phase 2460 frozen enemies use image overlays while preserving the legacy ring fallback', () => {
  assert.match(gameSource, /freezeControlVfxSprite/);
  assert.match(gameSource, /freezeControlVfxClassForEnemyType/);
  assert.match(gameSource, /this\.freezeControlVfxAtlasReady&&this\.freezeControlVfxAtlasImage/);
  assert.match(gameSource, /enemyStatusCue\('freeze'\)/);
  assert.match(gameSource, /ctx\.beginPath\(\); ctx\.arc\(enemy\.pos\.x, enemy\.pos\.y, enemy\.radius \+ 6/);
});

test('phase 2461 slowed enemy deaths queue freeze shatter bursts without mutating death rewards', () => {
  assert.match(gameSource, /death\.wasSlowed/);
  assert.match(gameSource, /queueFreezeShatterVfx/);
  assert.match(gameSource, /freezeShatterVfx/);
  assert.match(enemiesSource, /wasSlowed\?: boolean/);
  assert.match(enemiesSource, /wasSlowed: enemy\.slowTimer > 0/);
  assert.match(enemiesSource, /xp: Math\.round\(enemy\.xp \* mythicLastLawReward\)/);
  assert.match(enemiesSource, /gold: Math\.round\(enemy\.gold \* mythicLastLawReward\)/);
});

test('phase 2460-2461 game initializes both atlases and keeps them presentation-only', () => {
  assert.match(gameSource, /initializeSurvivalResponseVfxAtlas/);
  assert.match(gameSource, /initializeFreezeControlVfxAtlas/);
  assert.match(gameSource, /drawSurvivalResponseVfx\(ctx\)/);
  assert.match(gameSource, /drawFreezeShatterVfx\(ctx\)/);
  assert.match(gameSource, /survivalResponseVfxAtlasImage/);
  assert.match(gameSource, /freezeControlVfxAtlasImage/);
});

test('phase 2462 deterministic survival-control audit is release-bound and fail-closed', async () => {
  const mod = await importRequired('../src/game/survival-control-vfx-audit.ts', '../dist/game/survival-control-vfx-audit.js');
  const audit = mod.runSurvivalControlVfxAudit();
  assert.equal(audit.samples.length, 64);
  assert.equal(audit.actionCount, 9);
  assert.equal(audit.presentationOnly, true);
  assert.equal(audit.gameplayFormulaMutation, false);
  assert.equal(audit.snapshotSchemaMutation, false);
  assert.equal(audit.loadFailureBlocksGameplay, false);
  assert.equal(audit.passed, true);
  assert.match(freezeSource, /survivalControlVfxPassed/);
  assert.match(freezeSource, /survivalControlVfxSamples/);
  assert.match(candidateSource, /survivalControlVfxPassed/);
  assert.match(candidateSource, /survival-control-vfx/);
});
