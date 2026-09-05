import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const gameSource=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const freezeSource=fs.readFileSync(new URL('../src/game/release-freeze-audit.ts',import.meta.url),'utf8');
const candidateSource=fs.readFileSync(new URL('../src/game/release-candidate-audit.ts',import.meta.url),'utf8');

test('phase 2607 objective failure dissolve atlas covers three objectives x fracture dissolve states',async()=>{
  assert.equal(fs.existsSync(new URL('../src/game/objective-failure-dissolve-vfx-assets.ts',import.meta.url)),true);
  const mod=await import('../dist/game/objective-failure-dissolve-vfx-assets.js');
  const audit=mod.auditObjectiveFailureDissolveVfxAtlas();
  assert.equal(audit.objectiveCount,3);assert.equal(audit.stateCount,2);assert.equal(audit.itemCount,6);assert.equal(audit.uniqueCellCount,6);assert.equal(audit.passed,true);
});

test('phase 2608 director timeout failure queues dissolve at the real active objective anchor',()=>{
  assert.match(gameSource,/objectiveTransition\.ended && this\.objectiveRuntime\.active[\s\S]{0,320}const failedAnchor=\{x:this\.objectiveRuntime\.active\.pos\.x,y:this\.objectiveRuntime\.active\.pos\.y\}[\s\S]{0,260}queueObjectiveFailureDissolveVfx\(objectiveTransition\.ended\.id,failedAnchor\.x,failedAnchor\.y\)/);
});

test('phase 2609 runtime rule failure queues dissolve before active objective state is cleared',()=>{
  assert.match(gameSource,/else if \(transition\.failed\)[\s\S]{0,240}queueObjectiveFailureDissolveVfx\(active\.id,active\.pos\.x,active\.pos\.y\)/);
});

test('phase 2610 failure cue transitions fracture to dissolve while staying on the failed anchor',()=>{
  assert.match(gameSource,/state=progress<0\.46\?'fracture':'dissolve'/);
  assert.match(gameSource,/objectiveFailureDissolveVfxSprite\(cue\.objectiveId,state\)/);
  assert.match(gameSource,/cue\.x-size\/2,cue\.y-size\/2/);
});

test('phase 2611 objective failure cues are bounded resettable reduced-flash aware and fail-open',()=>{
  assert.match(gameSource,/objectiveFailureDissolveVfx\.length>8/);
  assert.match(gameSource,/this\.objectiveFailureDissolveVfx=\[\]/);
  assert.match(gameSource,/initializeObjectiveFailureDissolveVfxAtlas/);
  assert.match(gameSource,/this\.presentationSettings\.reducedFlash\?0\.28:0\.54/);
  assert.match(gameSource,/if\(!this\.objectiveFailureDissolveVfxAtlasReady\|\|!this\.objectiveFailureDissolveVfxAtlasImage\)return/);
});

test('phase 2612 objective failure audit is deterministic release-bound and presentation-only',async()=>{
  assert.equal(fs.existsSync(new URL('../src/game/objective-failure-dissolve-vfx-audit.ts',import.meta.url)),true);
  const mod=await import('../dist/game/objective-failure-dissolve-vfx-audit.js'),audit=mod.runObjectiveFailureDissolveVfxAudit();
  assert.equal(audit.samples.length,64);assert.equal(audit.actionCount,9);assert.equal(audit.presentationOnly,true);assert.equal(audit.gameplayFormulaMutation,false);assert.equal(audit.snapshotSchemaMutation,false);assert.equal(audit.passed,true);
  assert.match(freezeSource,/objectiveFailureDissolveVfxPassed/);assert.match(candidateSource,/objectiveFailureDissolveVfxPassed/);assert.match(candidateSource,/objective-failure-dissolve-vfx/);
});
