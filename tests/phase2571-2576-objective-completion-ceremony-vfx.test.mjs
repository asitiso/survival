import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const gameSource=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const freezeSource=fs.readFileSync(new URL('../src/game/release-freeze-audit.ts',import.meta.url),'utf8');
const candidateSource=fs.readFileSync(new URL('../src/game/release-candidate-audit.ts',import.meta.url),'utf8');

test('phase 2571 objective completion ceremony atlas covers three objectives x burst reward states',async()=>{
  assert.equal(fs.existsSync(new URL('../src/game/objective-completion-ceremony-vfx-assets.ts',import.meta.url)),true);
  const mod=await import('../dist/game/objective-completion-ceremony-vfx-assets.js');
  const audit=mod.auditObjectiveCompletionCeremonyVfxAtlas();
  assert.equal(audit.objectiveCount,3);assert.equal(audit.stateCount,2);assert.equal(audit.itemCount,6);assert.equal(audit.uniqueCellCount,6);assert.equal(audit.passed,true);
});

test('phase 2572 completed objective queues ceremony at the real objective position with the real reward list',()=>{
  assert.match(gameSource,/queueObjectiveCompletionCeremonyVfx\(active\.id,active\.pos\.x,active\.pos\.y,transition\.rewards\)/);
  assert.match(gameSource,/this\.applyObjectiveRewards\(transition\.rewards\)/);
  assert.doesNotMatch(gameSource,/objectiveCompletionCeremonyCenter/);
});

test('phase 2573 objective ceremony transitions from burst to reward using only presentation ttl',()=>{
  assert.match(gameSource,/progress<0\.48\?'burst':'reward'/);
  assert.match(gameSource,/objectiveCompletionCeremonyVfxSprite\(cue\.objectiveId,state\)/);
  assert.match(gameSource,/cue\.rewardCount/);
});

test('phase 2574 objective ceremony queue is bounded resettable and advances on safe dt',()=>{
  assert.match(gameSource,/objectiveCompletionCeremonyVfx\.length>8/);
  assert.match(gameSource,/for\(const cue of this\.objectiveCompletionCeremonyVfx\)cue\.ttl-=safeDt/);
  assert.match(gameSource,/this\.objectiveCompletionCeremonyVfx=\[\]/);
});

test('phase 2575 objective ceremony atlas loading is fail-open and reduced-flash capped',()=>{
  assert.match(gameSource,/initializeObjectiveCompletionCeremonyVfxAtlas/);
  assert.match(gameSource,/objectiveCompletionCeremonyVfxAtlasImage/);
  assert.match(gameSource,/this\.presentationSettings\.reducedFlash\?0\.34:0\.66/);
});

test('phase 2576 objective ceremony audit is deterministic release-bound and presentation-only',async()=>{
  assert.equal(fs.existsSync(new URL('../src/game/objective-completion-ceremony-vfx-audit.ts',import.meta.url)),true);
  const mod=await import('../dist/game/objective-completion-ceremony-vfx-audit.js'),audit=mod.runObjectiveCompletionCeremonyVfxAudit();
  assert.equal(audit.samples.length,64);assert.equal(audit.actionCount,9);assert.equal(audit.presentationOnly,true);assert.equal(audit.gameplayFormulaMutation,false);assert.equal(audit.snapshotSchemaMutation,false);assert.equal(audit.passed,true);
  assert.match(freezeSource,/objectiveCompletionCeremonyVfxPassed/);assert.match(candidateSource,/objectiveCompletionCeremonyVfxPassed/);assert.match(candidateSource,/objective-completion-ceremony-vfx/);
});
