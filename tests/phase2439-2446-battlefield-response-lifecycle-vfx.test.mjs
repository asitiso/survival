import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const gameSource = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
const freezeSource = fs.readFileSync(new URL('../src/game/release-freeze-audit.ts', import.meta.url), 'utf8');
const candidateSource = fs.readFileSync(new URL('../src/game/release-candidate-audit.ts', import.meta.url), 'utf8');

function pngDimensions(buffer) {
  assert.equal(buffer.toString('ascii', 1, 4), 'PNG');
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

async function importIfPresent(sourceRelative, distRelative) {
  const sourceUrl = new URL(sourceRelative, import.meta.url);
  assert.equal(fs.existsSync(sourceUrl), true);
  if (!fs.existsSync(sourceUrl)) return null;
  return import(distRelative);
}

test('phase 2439 hero response atlas covers four heroes x hit evade flow states', async () => {
  const mod = await importIfPresent('../src/game/hero-response-vfx-assets.ts', '../dist/game/hero-response-vfx-assets.js');
  if (!mod) return;
  const audit = mod.auditHeroResponseVfxAtlas();
  assert.equal(audit.heroCount, 4);
  assert.equal(audit.itemCount, 12);
  assert.equal(audit.uniqueCellCount, 12);
  assert.equal(audit.coverage, 1);
  assert.deepEqual(audit.outOfBounds, []);
  assert.equal(audit.passed, true);
  const buffer = fs.readFileSync(path.resolve(mod.HERO_RESPONSE_VFX_ATLAS.src.replace(/^\.\//, '')));
  assert.deepEqual(pngDimensions(buffer), { width: 512, height: 384 });
  assert.ok(buffer.length > 6000);
});

test('phase 2440-2441 hero hit, perfect evade, and active flow boost are image-backed without replacing gameplay logic', () => {
  assert.match(gameSource, /initializeHeroResponseVfxAtlas/);
  assert.match(gameSource, /queueHeroResponseVfx\('hit'/);
  assert.match(gameSource, /queueHeroResponseVfx\('perfectEvade'/);
  assert.match(gameSource, /drawHeroResponseVfx/);
  assert.match(gameSource, /heroResponseVfxSprite\(this\.hero\.profileId,'flowBoost'\)/);
  assert.match(gameSource, /this\.elapsed \* 1000 < this\.arenaEvadeBoostUntilMs/);
});

test('phase 2442 boss weakpoint world atlas covers six node kinds x active break states', async () => {
  const mod = await importIfPresent('../src/game/boss-weakpoint-world-vfx-assets.ts', '../dist/game/boss-weakpoint-world-vfx-assets.js');
  if (!mod) return;
  const audit = mod.auditBossWeakpointWorldVfxAtlas();
  assert.equal(audit.kindCount, 6);
  assert.equal(audit.itemCount, 12);
  assert.equal(audit.uniqueCellCount, 12);
  assert.equal(audit.coverage, 1);
  assert.deepEqual(audit.outOfBounds, []);
  assert.equal(audit.passed, true);
  const buffer = fs.readFileSync(path.resolve(mod.BOSS_WEAKPOINT_WORLD_VFX_ATLAS.src.replace(/^\.\//, '')));
  assert.deepEqual(pngDimensions(buffer), { width: 384, height: 512 });
  assert.ok(buffer.length > 6000);
});

test('phase 2443 weakpoint nodes and final break use world vfx while keeping existing icon and hp fallback', () => {
  assert.match(gameSource, /initializeBossWeakpointWorldVfxAtlas/);
  assert.match(gameSource, /bossWeakpointWorldVfxSprite\(node\.kind,'active'\)/);
  assert.match(gameSource, /bossWeakpointIdentityIcon\(node\.kind\)/);
  assert.match(gameSource, /queueBossWeakpointBreakWorldVfx/);
  assert.match(gameSource, /drawBossWeakpointBreakWorldVfx/);
});

test('phase 2444 boss arena lifecycle atlas covers six hazards x telegraph active states', async () => {
  const mod = await importIfPresent('../src/game/boss-arena-lifecycle-vfx-assets.ts', '../dist/game/boss-arena-lifecycle-vfx-assets.js');
  if (!mod) return;
  const audit = mod.auditBossArenaLifecycleVfxAtlas();
  assert.equal(audit.kindCount, 6);
  assert.equal(audit.itemCount, 12);
  assert.equal(audit.uniqueCellCount, 12);
  assert.equal(audit.coverage, 1);
  assert.deepEqual(audit.outOfBounds, []);
  assert.equal(audit.passed, true);
  const buffer = fs.readFileSync(path.resolve(mod.BOSS_ARENA_LIFECYCLE_VFX_ATLAS.src.replace(/^\.\//, '')));
  assert.deepEqual(pngDimensions(buffer), { width: 384, height: 512 });
  assert.ok(buffer.length > 6000);
});

test('phase 2445 hazard telegraph and active states select different lifecycle cells while canvas geometry remains', () => {
  assert.match(gameSource, /initializeBossArenaLifecycleVfxAtlas/);
  assert.match(gameSource, /bossArenaLifecycleVfxSprite\(hazard\.kind,hazard\.telegraph>0\?'telegraph':'active'\)/);
  assert.match(gameSource, /hazard\.geometryShape/);
  assert.match(gameSource, /bossSpecialHazardVfxSprite\(hazard\.kind\)/);
});

test('phase 2446 deterministic audit and release candidate bind response lifecycle vfx fail-closed', async () => {
  const mod = await importIfPresent('../src/game/battlefield-response-lifecycle-vfx-audit.ts', '../dist/game/battlefield-response-lifecycle-vfx-audit.js');
  if (!mod) return;
  const audit = mod.runBattlefieldResponseLifecycleVfxAudit();
  assert.equal(audit.passed, true);
  assert.equal(audit.samples.length, 64);
  assert.equal(audit.gameplayFormulaMutation, false);
  assert.equal(audit.snapshotSchemaMutation, false);
  assert.equal(audit.newAtlasCount, 3);
  assert.match(freezeSource, /battlefieldResponseLifecycleVfxPassed/);
  assert.match(freezeSource, /battlefieldResponseLifecycleVfxSamples/);
  assert.match(candidateSource, /battlefieldResponseLifecycleVfxPassed/);
  assert.match(candidateSource, /battlefieldResponseLifecycleVfxSamples/);
});

test('phase 2443 final weakpoint break anchors to weakpoint field center instead of array order', () => {
  assert.match(gameSource, /const breakCenter=this\.bossEncounter\.nodes\.reduce\(\(sum,node\)=>\(\{x:sum\.x\+node\.pos\.x,y:sum\.y\+node\.pos\.y\}\),\{x:0,y:0\}\);/);
  assert.match(gameSource, /breakCenter\.x\/=total;breakCenter\.y\/=total;/);
  assert.doesNotMatch(gameSource, /nodes\[this\.bossEncounter\.nodes\.length-1\]/);
});
