import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const gameSource=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const freezeSource=fs.readFileSync(new URL('../src/game/release-freeze-audit.ts',import.meta.url),'utf8');
const candidateSource=fs.readFileSync(new URL('../src/game/release-candidate-audit.ts',import.meta.url),'utf8');

test('phase 2589 objective activation materialization atlas covers three objectives x materialize locator states',async()=>{
  assert.equal(fs.existsSync(new URL('../src/game/objective-activation-materialization-vfx-assets.ts',import.meta.url)),true);
  const mod=await import('../dist/game/objective-activation-materialization-vfx-assets.js');
  const audit=mod.auditObjectiveActivationMaterializationVfxAtlas();
  assert.equal(audit.objectiveCount,3);assert.equal(audit.stateCount,2);assert.equal(audit.itemCount,6);assert.equal(audit.uniqueCellCount,6);assert.equal(audit.passed,true);
});

test('phase 2590 a real objective start queues activation at the chosen runtime anchor',()=>{
  assert.match(gameSource,/this\.objectiveRuntime\.begin\(objectiveTransition\.started\.id, pos\);[\s\S]{0,180}this\.queueObjectiveActivationMaterializationVfx\(objectiveTransition\.started\.id,pos\.x,pos\.y\)/);
});

test('phase 2591 locator stamp follows the live hero to objective vector',()=>{
  assert.match(gameSource,/const dx=cue\.x-this\.hero\.pos\.x,dy=cue\.y-this\.hero\.pos\.y/);
  assert.match(gameSource,/Math\.atan2\(dy,dx\)/);
  assert.match(gameSource,/objectiveActivationMaterializationVfxSprite\(cue\.objectiveId,'locator'\)/);
});

test('phase 2592 materialize stamp remains anchored to the real objective position',()=>{
  assert.match(gameSource,/objectiveActivationMaterializationVfxSprite\(cue\.objectiveId,'materialize'\)/);
  assert.match(gameSource,/cue\.x-materializeSize\/2/);
  assert.match(gameSource,/cue\.y-materializeSize\/2/);
});

test('phase 2593 activation cues are bounded resettable reduced-flash aware and atlas-fail-open',()=>{
  assert.match(gameSource,/objectiveActivationMaterializationVfx\.length>8/);
  assert.match(gameSource,/this\.objectiveActivationMaterializationVfx=\[\]/);
  assert.match(gameSource,/initializeObjectiveActivationMaterializationVfxAtlas/);
  assert.match(gameSource,/this\.presentationSettings\.reducedFlash\?0\.26:0\.48/);
  assert.match(gameSource,/if\(!this\.objectiveActivationMaterializationVfxAtlasReady\|\|!this\.objectiveActivationMaterializationVfxAtlasImage\)return/);
});

test('phase 2594 objective activation audit is deterministic release-bound and presentation-only',async()=>{
  assert.equal(fs.existsSync(new URL('../src/game/objective-activation-materialization-vfx-audit.ts',import.meta.url)),true);
  const mod=await import('../dist/game/objective-activation-materialization-vfx-audit.js'),audit=mod.runObjectiveActivationMaterializationVfxAudit();
  assert.equal(audit.samples.length,64);assert.equal(audit.actionCount,9);assert.equal(audit.presentationOnly,true);assert.equal(audit.gameplayFormulaMutation,false);assert.equal(audit.snapshotSchemaMutation,false);assert.equal(audit.passed,true);
  assert.match(freezeSource,/objectiveActivationMaterializationVfxPassed/);assert.match(candidateSource,/objectiveActivationMaterializationVfxPassed/);assert.match(candidateSource,/objective-activation-materialization-vfx/);
});
