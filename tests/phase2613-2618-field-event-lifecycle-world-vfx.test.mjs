import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const gameSource=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const freezeSource=fs.readFileSync(new URL('../src/game/release-freeze-audit.ts',import.meta.url),'utf8');
const candidateSource=fs.readFileSync(new URL('../src/game/release-candidate-audit.ts',import.meta.url),'utf8');

test('phase 2613 field event lifecycle atlas covers five events x entrance exit states',async()=>{
  assert.equal(fs.existsSync(new URL('../src/game/field-event-lifecycle-world-vfx-assets.ts',import.meta.url)),true);
  const mod=await import('../dist/game/field-event-lifecycle-world-vfx-assets.js');
  const audit=mod.auditFieldEventLifecycleWorldVfxAtlas();
  assert.equal(audit.eventCount,5);assert.equal(audit.stateCount,2);assert.equal(audit.itemCount,10);assert.equal(audit.uniqueCellCount,10);assert.equal(audit.passed,true);
});

test('phase 2614 event start stores a world anchor and queues entrance after event-specific spawning',()=>{
  assert.match(gameSource,/private handleFieldEventStart\(event: ActiveFieldEvent\): void \{[\s\S]{0,1700}this\.fieldEventWorldAnchor=anchor;[\s\S]{0,180}queueFieldEventLifecycleWorldVfx\(event\.id,'entrance',anchor\.x,anchor\.y\)/);
  assert.match(gameSource,/event\.id === 'goldenGoblin'[\s\S]{0,420}anchor=\{id:event\.id,x:pos\.x,y:pos\.y\}/);
  assert.match(gameSource,/event\.id === 'supplyDrop'[\s\S]{0,340}anchor=\{id:event\.id,x:this\.supplyCrate\.x,y:this\.supplyCrate\.y\}/);
});

test('phase 2615 timed and early-completed field events emit exit at the retained event anchor',()=>{
  assert.match(gameSource,/private finishFieldEventLifecycleWorldVfx\(event:ActiveFieldEvent\)/);
  assert.match(gameSource,/handleFieldEventEnd\(event: ActiveFieldEvent\)[\s\S]{0,160}finishFieldEventLifecycleWorldVfx\(event\)/);
  assert.match(gameSource,/completeActive\(this\.elapsed\)[\s\S]{0,180}finishFieldEventLifecycleWorldVfx\(ended\)/);
});

test('phase 2616 lifecycle world cue keeps entrance exit visuals on the stored anchor',()=>{
  assert.match(gameSource,/fieldEventLifecycleWorldVfxSprite\(cue\.eventId,cue\.state\)/);
  assert.match(gameSource,/cue\.x-size\/2,cue\.y-size\/2/);
  assert.match(gameSource,/state:FieldEventLifecycleWorldVfxState/);
});

test('phase 2617 lifecycle cues are bounded resettable reduced-flash aware and atlas-fail-open',()=>{
  assert.match(gameSource,/fieldEventLifecycleWorldVfx\.length>10/);
  assert.match(gameSource,/this\.fieldEventLifecycleWorldVfx=\[\]/);
  assert.match(gameSource,/this\.fieldEventWorldAnchor=null/);
  assert.match(gameSource,/this\.presentationSettings\.reducedFlash\?0\.26:0\.50/);
  assert.match(gameSource,/if\(!this\.fieldEventLifecycleWorldVfxAtlasReady\|\|!this\.fieldEventLifecycleWorldVfxAtlasImage\)return/);
});

test('phase 2618 field event lifecycle audit is deterministic release-bound and presentation-only',async()=>{
  assert.equal(fs.existsSync(new URL('../src/game/field-event-lifecycle-world-vfx-audit.ts',import.meta.url)),true);
  const mod=await import('../dist/game/field-event-lifecycle-world-vfx-audit.js'),audit=mod.runFieldEventLifecycleWorldVfxAudit();
  assert.equal(audit.samples.length,64);assert.equal(audit.actionCount,9);assert.equal(audit.presentationOnly,true);assert.equal(audit.gameplayFormulaMutation,false);assert.equal(audit.snapshotSchemaMutation,false);assert.equal(audit.passed,true);
  assert.match(freezeSource,/fieldEventLifecycleWorldVfxPassed/);assert.match(candidateSource,/fieldEventLifecycleWorldVfxPassed/);assert.match(candidateSource,/field-event-lifecycle-world-vfx/);
});
