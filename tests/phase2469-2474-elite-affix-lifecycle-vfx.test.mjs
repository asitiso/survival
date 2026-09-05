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

test('phase 2469 elite affix lifecycle atlas covers six affixes x active response states', async () => {
  const mod = await importRequired('../src/game/elite-affix-lifecycle-vfx-assets.ts', '../dist/game/elite-affix-lifecycle-vfx-assets.js');
  const audit = mod.auditEliteAffixLifecycleVfxAtlas();
  assert.equal(audit.affixCount, 6);
  assert.equal(audit.stateCount, 2);
  assert.equal(audit.itemCount, 12);
  assert.equal(audit.uniqueCellCount, 12);
  assert.equal(audit.coverage, 1);
  assert.equal(audit.passed, true);
  const buffer = fs.readFileSync(path.resolve(mod.ELITE_AFFIX_LIFECYCLE_VFX_ATLAS.src.replace(/^\.\//, '')));
  assert.deepEqual(pngDimensions(buffer), { width: 768, height: 256 });
  assert.ok(buffer.length > 7000);
});

test('phase 2470 elite affixes gain active world overlays while legacy identity icons remain', () => {
  assert.match(enemiesSource, /eliteAffixLifecycleVfxSprite\(affixId,'active'\)/);
  assert.match(enemiesSource, /eliteAffixIdentityIcon\(affixId\)/);
  assert.match(enemiesSource, /eliteAffixAtlasReady && eliteAffixAtlasImage/);
});

test('phase 2471 armored and mana shield responses are image-backed without changing damage math', () => {
  assert.match(enemiesSource, /queueEliteAffixResponseVfx\(enemy,'armored'\)/);
  assert.match(enemiesSource, /queueEliteAffixResponseVfx\(enemy,'manaShield'\)/);
  assert.match(enemiesSource, /remaining \* \(enemy\.damageTakenMultiplier \?\? 1\) \* bossEncounterMultiplier/);
  assert.match(enemiesSource, /enemy\.manaShield = Math\.max\(0, \(enemy\.manaShield \?\? 0\) - absorbed\)/);
});

test('phase 2472 regeneration and frenzy threshold responses preserve existing formulas', () => {
  assert.match(enemiesSource, /queueEliteAffixResponseVfx\(enemy,'regenerating'\)/);
  assert.match(enemiesSource, /queueEliteAffixResponseVfx\(enemy,'frenzied'\)/);
  assert.match(enemiesSource, /enemy\.maxHp \* \(enemy\.regenPerSecondRatio \?\? 0\) \* dt/);
  assert.match(enemiesSource, /enemy\.hp \/ Math\.max\(1, enemy\.maxHp\) <= 0\.42/);
});

test('phase 2473 swift and commander responses reuse existing attack and aura paths with bounded queues', () => {
  assert.match(enemiesSource, /queueEliteAffixResponseVfx\(enemy,'swift'\)/);
  assert.match(enemiesSource, /queueEliteAffixResponseVfx\(candidate,'commander'\)/);
  assert.match(enemiesSource, /eliteAffixResponseVfx\.length > 32/);
  assert.match(enemiesSource, /return candidate\.commandAuraMultiplier \?\? 1/);
});

test('phase 2474 elite affix lifecycle audit is release-bound presentation-only and fail-open', async () => {
  const mod = await importRequired('../src/game/elite-affix-lifecycle-vfx-audit.ts', '../dist/game/elite-affix-lifecycle-vfx-audit.js');
  const audit = mod.runEliteAffixLifecycleVfxAudit();
  assert.equal(audit.samples.length, 64);
  assert.equal(audit.actionCount, 9);
  assert.equal(audit.presentationOnly, true);
  assert.equal(audit.gameplayFormulaMutation, false);
  assert.equal(audit.snapshotSchemaMutation, false);
  assert.equal(audit.loadFailureBlocksGameplay, false);
  assert.equal(audit.passed, true);
  assert.match(gameSource, /initializeEliteAffixLifecycleVfxAtlas/);
  assert.match(freezeSource, /eliteAffixLifecycleVfxPassed/);
  assert.match(candidateSource, /eliteAffixLifecycleVfxPassed/);
  assert.match(candidateSource, /elite-affix-lifecycle-vfx/);
});
