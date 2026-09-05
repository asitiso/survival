import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const enemySource=fs.readFileSync(new URL('../src/game/enemies.ts',import.meta.url),'utf8');
const gameSource=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const freezeSource=fs.readFileSync(new URL('../src/game/release-freeze-audit.ts',import.meta.url),'utf8');
const candidateSource=fs.readFileSync(new URL('../src/game/release-candidate-audit.ts',import.meta.url),'utf8');
function pngDimensions(buffer){assert.equal(buffer.toString('ascii',1,4),'PNG');return{width:buffer.readUInt32BE(16),height:buffer.readUInt32BE(20)};}
async function load(){assert.equal(fs.existsSync(new URL('../src/game/boss-projectile-lifecycle-vfx-assets.ts',import.meta.url)),true);return import('../dist/game/boss-projectile-lifecycle-vfx-assets.js');}

test('phase 2499 boss projectile lifecycle atlas covers six archetypes x travel impact',async()=>{const mod=await load(),audit=mod.auditBossProjectileLifecycleVfxAtlas();assert.equal(audit.archetypeCount,6);assert.equal(audit.stateCount,2);assert.equal(audit.itemCount,12);assert.equal(audit.uniqueCellCount,12);assert.equal(audit.passed,true);const b=fs.readFileSync(path.resolve(mod.BOSS_PROJECTILE_LIFECYCLE_VFX_ATLAS.src.replace(/^\.\//,'')));assert.deepEqual(pngDimensions(b),{width:768,height:256});assert.ok(b.length>6000);});
test('phase 2500 boss projectile travel state renders from actual projectile archetype',()=>{assert.match(enemySource,/bossProjectileLifecycleVfxSprite\(projectile\.bossArchetype,'travel'\)/);assert.match(enemySource,/renderProjectiles\([\s\S]*bossProjectileLifecycleVfxAtlasReady/);});
test('phase 2501 boss projectile collision queues archetype-specific impact before projectile expires',()=>{assert.match(enemySource,/bossProjectileImpactVfx/);assert.match(enemySource,/p\.bossArchetype[\s\S]*bossProjectileImpactVfx\.push/);assert.match(enemySource,/p\.ttl = -1/);});
test('phase 2502 projectile lifecycle remains bounded and does not alter damage formula',()=>{assert.match(enemySource,/bossProjectileImpactVfx\.length>24/);assert.match(enemySource,/damage: enemy\.damage \* 0\.72/);assert.match(enemySource,/damage: enemy\.damage \* 0\.62/);});
test('phase 2503 boss projectile lifecycle atlas loads independently and remains fail-open',()=>{assert.match(gameSource,/initializeBossProjectileLifecycleVfxAtlas/);assert.match(gameSource,/bossProjectileLifecycleVfxAtlasImage/);assert.match(enemySource,/ctx\.onHeroDamage\(p\.damage, 'projectile'\)/);});
test('phase 2504 boss projectile lifecycle audit is release-bound deterministic and presentation-only',async()=>{assert.equal(fs.existsSync(new URL('../src/game/boss-projectile-lifecycle-vfx-audit.ts',import.meta.url)),true);const mod=await import('../dist/game/boss-projectile-lifecycle-vfx-audit.js'),audit=mod.runBossProjectileLifecycleVfxAudit();assert.equal(audit.samples.length,64);assert.equal(audit.actionCount,9);assert.equal(audit.presentationOnly,true);assert.equal(audit.gameplayFormulaMutation,false);assert.equal(audit.snapshotSchemaMutation,false);assert.equal(audit.passed,true);assert.match(freezeSource,/bossProjectileLifecycleVfxPassed/);assert.match(candidateSource,/bossProjectileLifecycleVfxPassed/);assert.match(candidateSource,/boss-projectile-lifecycle-vfx/);});
