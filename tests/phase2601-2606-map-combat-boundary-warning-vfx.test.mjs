import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const gameSource=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const freezeSource=fs.readFileSync(new URL('../src/game/release-freeze-audit.ts',import.meta.url),'utf8');
const candidateSource=fs.readFileSync(new URL('../src/game/release-candidate-audit.ts',import.meta.url),'utf8');

test('phase 2601 map combat boundary warning atlas covers three maps x boundary obstacle states',async()=>{
  assert.equal(fs.existsSync(new URL('../src/game/map-combat-boundary-warning-vfx-assets.ts',import.meta.url)),true);
  const mod=await import('../dist/game/map-combat-boundary-warning-vfx-assets.js');
  const audit=mod.auditMapCombatBoundaryWarningVfxAtlas();
  assert.equal(audit.mapCount,3);assert.equal(audit.kindCount,2);assert.equal(audit.itemCount,6);assert.equal(audit.uniqueCellCount,6);assert.equal(audit.passed,true);
});

test('phase 2602 boundary warning derives proximity from the real arena rectangle',()=>{
  assert.match(gameSource,/const left=ARENA_MARGIN,right=LOGICAL_WIDTH-ARENA_MARGIN,top=ARENA_MARGIN\+38,bottom=LOGICAL_HEIGHT-ARENA_MARGIN/);
  assert.match(gameSource,/const boundaryDistances=\[this\.hero\.pos\.x-left,right-this\.hero\.pos\.x,this\.hero\.pos\.y-top,bottom-this\.hero\.pos\.y\]/);
});

test('phase 2603 boundary accent appears only near the closest real edge',()=>{
  assert.match(gameSource,/if\(nearestBoundaryDistance<=118\)/);
  assert.match(gameSource,/mapCombatBoundaryWarningVfxSprite\(mapId,'boundary'\)/);
  assert.match(gameSource,/nearestBoundaryIndex<2\?Math\.PI\/2:0/);
});

test('phase 2604 obstacle warning uses closest points on actual wall rectangles and caps clutter',()=>{
  assert.match(gameSource,/const px=clamp\(this\.hero\.pos\.x,wall\.x,wall\.x\+wall\.w\),py=clamp\(this\.hero\.pos\.y,wall\.y,wall\.y\+wall\.h\)/);
  assert.match(gameSource,/Math\.hypot\(this\.hero\.pos\.x-px,this\.hero\.pos\.y-py\)/);
  assert.match(gameSource,/\.slice\(0,3\)/);
  assert.match(gameSource,/mapCombatBoundaryWarningVfxSprite\(mapId,'obstacle'\)/);
});

test('phase 2605 warning layer is atlas-fail-open reduced-flash aware and never mutates movement or collision',()=>{
  assert.match(gameSource,/initializeMapCombatBoundaryWarningVfxAtlas/);
  assert.match(gameSource,/if\(!this\.mapCombatBoundaryWarningVfxAtlasReady\|\|!this\.mapCombatBoundaryWarningVfxAtlasImage\)return/);
  assert.match(gameSource,/this\.presentationSettings\.reducedFlash\?0\.22:0\.40/);
  assert.doesNotMatch(gameSource,/boundaryWarningSpeedMultiplier|obstacleWarningCollisionMultiplier/);
});

test('phase 2606 map combat boundary warning audit is deterministic release-bound and presentation-only',async()=>{
  assert.equal(fs.existsSync(new URL('../src/game/map-combat-boundary-warning-vfx-audit.ts',import.meta.url)),true);
  const mod=await import('../dist/game/map-combat-boundary-warning-vfx-audit.js'),audit=mod.runMapCombatBoundaryWarningVfxAudit();
  assert.equal(audit.samples.length,64);assert.equal(audit.actionCount,9);assert.equal(audit.presentationOnly,true);assert.equal(audit.gameplayFormulaMutation,false);assert.equal(audit.snapshotSchemaMutation,false);assert.equal(audit.passed,true);
  assert.match(freezeSource,/mapCombatBoundaryWarningVfxPassed/);assert.match(candidateSource,/mapCombatBoundaryWarningVfxPassed/);assert.match(candidateSource,/map-combat-boundary-warning-vfx/);
});
