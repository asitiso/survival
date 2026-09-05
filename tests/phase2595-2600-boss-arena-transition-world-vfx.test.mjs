import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const gameSource=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const freezeSource=fs.readFileSync(new URL('../src/game/release-freeze-audit.ts',import.meta.url),'utf8');
const candidateSource=fs.readFileSync(new URL('../src/game/release-candidate-audit.ts',import.meta.url),'utf8');

test('phase 2595 boss arena transition atlas covers six archetypes x entrance exit states',async()=>{
  assert.equal(fs.existsSync(new URL('../src/game/boss-arena-transition-world-vfx-assets.ts',import.meta.url)),true);
  const mod=await import('../dist/game/boss-arena-transition-world-vfx-assets.js');
  const audit=mod.auditBossArenaTransitionWorldVfxAtlas();
  assert.equal(audit.archetypeCount,6);assert.equal(audit.stateCount,2);assert.equal(audit.itemCount,12);assert.equal(audit.uniqueCellCount,12);assert.equal(audit.passed,true);
});

test('phase 2596 boss spawn queues entrance world vfx on the real boss position',()=>{
  assert.match(gameSource,/this\.bossSignatureEntranceUntil = this\.elapsed \+ 1\.15;[\s\S]{0,180}this\.queueBossArenaTransitionWorldVfx\(archetype,'entrance',enemy\.pos\.x,enemy\.pos\.y,enemy\.radius\)/);
});

test('phase 2597 boss death queues exit world vfx at the actual death position',()=>{
  assert.match(gameSource,/if\(death\.type==='boss'\)\{[\s\S]{0,220}this\.queueBossArenaTransitionWorldVfx\(archetype,'exit',death\.x,death\.y,72\)/);
});

test('phase 2598 arena transition queue is bounded resettable and position anchored',()=>{
  assert.match(gameSource,/bossArenaTransitionWorldVfx\.length>12/);
  assert.match(gameSource,/this\.bossArenaTransitionWorldVfx=\[\]/);
  assert.match(gameSource,/cue\.x-size\/2,cue\.y-size\/2,size,size/);
});

test('phase 2599 transition atlas is loaded fail-open and respects reduced flash',()=>{
  assert.match(gameSource,/initializeBossArenaTransitionWorldVfxAtlas/);
  assert.match(gameSource,/if\(!this\.bossArenaTransitionWorldVfxAtlasReady\|\|!this\.bossArenaTransitionWorldVfxAtlasImage\)return/);
  assert.match(gameSource,/this\.presentationSettings\.reducedFlash\?0\.30:0\.58/);
});

test('phase 2600 boss arena transition audit is deterministic release-bound and presentation-only',async()=>{
  assert.equal(fs.existsSync(new URL('../src/game/boss-arena-transition-world-vfx-audit.ts',import.meta.url)),true);
  const mod=await import('../dist/game/boss-arena-transition-world-vfx-audit.js'),audit=mod.runBossArenaTransitionWorldVfxAudit();
  assert.equal(audit.samples.length,64);assert.equal(audit.actionCount,9);assert.equal(audit.presentationOnly,true);assert.equal(audit.gameplayFormulaMutation,false);assert.equal(audit.snapshotSchemaMutation,false);assert.equal(audit.passed,true);
  assert.match(freezeSource,/bossArenaTransitionWorldVfxPassed/);assert.match(candidateSource,/bossArenaTransitionWorldVfxPassed/);assert.match(candidateSource,/boss-arena-transition-world-vfx/);
});
