import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const gameSource=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const freezeSource=fs.readFileSync(new URL('../src/game/release-freeze-audit.ts',import.meta.url),'utf8');
const candidateSource=fs.readFileSync(new URL('../src/game/release-candidate-audit.ts',import.meta.url),'utf8');
const moduleExists=fs.existsSync(new URL('../dist/game/world-vfx-occlusion-guard.js',import.meta.url));
const mod=moduleExists?await import('../dist/game/world-vfx-occlusion-guard.js'):null;

test('phase 2631 occlusion guard detects overlap with protected critical hero core anchors',()=>{
  assert.ok(mod,'world-vfx-occlusion-guard module must exist');if(!mod)return;
  const overlap=mod.worldVfxOcclusionScale({priority:'decorative',cue:{x:100,y:100,radius:80},protectedAnchors:[{x:140,y:100,radius:96}]});
  const clear=mod.worldVfxOcclusionScale({priority:'decorative',cue:{x:100,y:100,radius:30},protectedAnchors:[{x:500,y:500,radius:96}]});
  assert.equal(overlap,0);assert.equal(clear,1);
});

test('phase 2632 overlapping informational and tactical cues dim instead of hiding important context',()=>{
  assert.ok(mod);if(!mod)return;
  const input={cue:{x:100,y:100,radius:80},protectedAnchors:[{x:120,y:100,radius:96}]};
  const info=mod.worldVfxOcclusionScale({...input,priority:'informational'});
  const tactical=mod.worldVfxOcclusionScale({...input,priority:'tactical'});
  assert.ok(info>0&&info<=0.35);assert.ok(tactical>=0.5&&tactical<1);assert.ok(tactical>info);
});

test('phase 2633 critical cues are never occluded by the presentation guard',()=>{
  assert.ok(mod);if(!mod)return;
  const scale=mod.worldVfxOcclusionScale({priority:'critical',cue:{x:100,y:100,radius:200},protectedAnchors:[{x:100,y:100,radius:140}]});
  assert.equal(scale,1);
});

test('phase 2634 game exposes hero core critical protection anchors without mutating combat state',()=>{
  assert.match(gameSource,/private currentWorldVfxProtectedAnchors\(\):WorldVfxProtectedAnchor\[\]/);
  assert.match(gameSource,/this\.dangerState\.heroCritical[\s\S]{0,220}this\.hero\.pos/);
  assert.match(gameSource,/this\.dangerState\.coreCritical[\s\S]{0,220}this\.core\.pos/);
  assert.doesNotMatch(gameSource,/worldVfxProtected.*(?:hp\s*=|damage|speed|cooldown)/i);
});

test('phase 2635 large recent world cues combine priority alpha with occlusion scale around critical anchors',()=>{
  assert.match(gameSource,/private worldVfxCueAlpha\(priority:WorldVfxPriority,x:number,y:number,radius:number\):number/);
  assert.match(gameSource,/drawObjectiveFailureDissolveVfx[\s\S]{0,1100}worldVfxCueAlpha\('tactical',cue\.x,cue\.y,size\*\.5\)/);
  assert.match(gameSource,/drawFieldEventLifecycleWorldVfx[\s\S]{0,1100}worldVfxCueAlpha\('informational',cue\.x,cue\.y,size\*\.5\)/);
  assert.match(gameSource,/drawObjectiveCompletionCeremonyVfx[\s\S]{0,1100}worldVfxCueAlpha\('informational',cue\.x,cue\.y,size\*\.5\)/);
});

test('phase 2636 occlusion guard audit is deterministic release-bound and presentation-only',async()=>{
  assert.equal(fs.existsSync(new URL('../src/game/world-vfx-occlusion-guard-audit.ts',import.meta.url)),true);
  if(!fs.existsSync(new URL('../dist/game/world-vfx-occlusion-guard-audit.js',import.meta.url)))return;
  const auditMod=await import('../dist/game/world-vfx-occlusion-guard-audit.js'),audit=auditMod.runWorldVfxOcclusionGuardAudit();
  assert.equal(audit.samples.length,64);assert.equal(audit.actionCount,9);assert.equal(audit.presentationOnly,true);assert.equal(audit.gameplayFormulaMutation,false);assert.equal(audit.snapshotSchemaMutation,false);assert.equal(audit.passed,true);
  assert.match(freezeSource,/worldVfxOcclusionGuardPassed/);assert.match(candidateSource,/worldVfxOcclusionGuardPassed/);assert.match(candidateSource,/world-vfx-occlusion-guard/);
});
