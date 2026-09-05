import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const gameSource=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const freezeSource=fs.readFileSync(new URL('../src/game/release-freeze-audit.ts',import.meta.url),'utf8');
const candidateSource=fs.readFileSync(new URL('../src/game/release-candidate-audit.ts',import.meta.url),'utf8');

test('phase 2583 map safe-lane transition atlas covers three maps x path arrival states',async()=>{
  assert.equal(fs.existsSync(new URL('../src/game/map-safe-lane-transition-vfx-assets.ts',import.meta.url)),true);
  const mod=await import('../dist/game/map-safe-lane-transition-vfx-assets.js');
  const audit=mod.auditMapSafeLaneTransitionVfxAtlas();
  assert.equal(audit.mapCount,3);assert.equal(audit.stateCount,2);assert.equal(audit.itemCount,6);assert.equal(audit.uniqueCellCount,6);assert.equal(audit.passed,true);
});

test('phase 2584 path stamp follows current map and the actual hero to safe-lane vector',()=>{
  assert.match(gameSource,/mapSafeLaneTransitionVfxSprite\(this\.terrain\.currentLayout\.id,'path'\)/);
  assert.match(gameSource,/const dx=safeLane\.target\.x-this\.hero\.pos\.x,dy=safeLane\.target\.y-this\.hero\.pos\.y/);
  assert.match(gameSource,/Math\.atan2\(dy,dx\)/);
});

test('phase 2585 arrival stamp anchors to the actual safe-lane target',()=>{
  assert.match(gameSource,/mapSafeLaneTransitionVfxSprite\(this\.terrain\.currentLayout\.id,'arrival'\)/);
  assert.match(gameSource,/safeLane\.target\.x-arrivalSize\/2/);
  assert.match(gameSource,/safeLane\.target\.y-arrivalSize\/2/);
});

test('phase 2586 transition overlay preserves the existing safe-lane line and only adds presentation alpha',()=>{
  assert.match(gameSource,/ctx\.lineTo\(safeLane\.target\.x, safeLane\.target\.y\)/);
  assert.match(gameSource,/const transitionAlpha=this\.presentationSettings\.reducedFlash\?0\.24:0\.44/);
  assert.doesNotMatch(gameSource,/safeLaneSpeedMultiplier/);
});

test('phase 2587 map safe-lane atlas is game-loaded fail-open and does not block navigation fallback',()=>{
  assert.match(gameSource,/initializeMapSafeLaneTransitionVfxAtlas/);
  assert.match(gameSource,/mapSafeLaneTransitionVfxAtlasImage/);
  assert.match(gameSource,/if\(this\.mapSafeLaneTransitionVfxAtlasReady&&this\.mapSafeLaneTransitionVfxAtlasImage\)/);
});

test('phase 2588 map safe-lane transition audit is deterministic release-bound and presentation-only',async()=>{
  assert.equal(fs.existsSync(new URL('../src/game/map-safe-lane-transition-vfx-audit.ts',import.meta.url)),true);
  const mod=await import('../dist/game/map-safe-lane-transition-vfx-audit.js'),audit=mod.runMapSafeLaneTransitionVfxAudit();
  assert.equal(audit.samples.length,64);assert.equal(audit.actionCount,9);assert.equal(audit.presentationOnly,true);assert.equal(audit.gameplayFormulaMutation,false);assert.equal(audit.snapshotSchemaMutation,false);assert.equal(audit.passed,true);
  assert.match(freezeSource,/mapSafeLaneTransitionVfxPassed/);assert.match(candidateSource,/mapSafeLaneTransitionVfxPassed/);assert.match(candidateSource,/map-safe-lane-transition-vfx/);
});
