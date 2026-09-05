import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const gameSource=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const patternSource=fs.readFileSync(new URL('../src/game/endless/final-form-patterns.ts',import.meta.url),'utf8');
const freezeSource=fs.readFileSync(new URL('../src/game/release-freeze-audit.ts',import.meta.url),'utf8');
const candidateSource=fs.readFileSync(new URL('../src/game/release-candidate-audit.ts',import.meta.url),'utf8');
function pngDimensions(buffer){assert.equal(buffer.toString('ascii',1,4),'PNG');return{width:buffer.readUInt32BE(16),height:buffer.readUInt32BE(20)};}
async function importRequired(sourceRelative,distRelative){assert.equal(fs.existsSync(new URL(sourceRelative,import.meta.url)),true,`${sourceRelative} must exist`);return import(distRelative);}

test('phase 2481 final form world atlas covers 12 forms x signature flow states',async()=>{
  const mod=await importRequired('../src/game/final-form-world-vfx-assets.ts','../dist/game/final-form-world-vfx-assets.js');
  const audit=mod.auditFinalFormWorldVfxAtlas();
  assert.equal(mod.FINAL_FORM_WORLD_VFX_IDS.length,12);
  assert.deepEqual(mod.FINAL_FORM_WORLD_VFX_STATES,['signature','flow']);
  assert.equal(audit.formCount,12); assert.equal(audit.stateCount,2); assert.equal(audit.itemCount,24); assert.equal(audit.uniqueCellCount,24); assert.equal(audit.passed,true);
  const buffer=fs.readFileSync(path.resolve(mod.FINAL_FORM_WORLD_VFX_ATLAS.src.replace(/^\.\//,'')));
  assert.deepEqual(pngDimensions(buffer),{width:768,height:512}); assert.ok(buffer.length>12000);
});

test('phase 2482 final form signature pattern queues image world identity without changing attack pattern data',()=>{
  assert.match(gameSource,/queueFinalFormWorldVfx\(formId, link \? 'flow' : 'signature'/);
  assert.match(gameSource,/const pattern = finalFormAttackPattern\(formId\)/);
  assert.match(patternSource,/'solar-sovereign': \{ formId:'solar-sovereign', kind:'nova', radius:310, damageMultiplier:1\.42/);
  assert.match(patternSource,/'thunder-tyrant': \{ formId:'thunder-tyrant', kind:'chain', radius:290, damageMultiplier:1\.36/);
});

test('phase 2483 final form world VFX queue is bounded and rendered as signature then flow identity',()=>{
  assert.match(gameSource,/finalFormWorldVfx\.length > 24/);
  assert.match(gameSource,/finalFormWorldVfxSprite\(vfx\.formId,vfx\.state\)/);
  assert.match(gameSource,/drawFinalFormWorldVfx/);
});

test('phase 2484 final form flow keeps legacy telegraph and impact fallbacks',()=>{
  assert.match(gameSource,/state === 'flow' \? 0\.92 : 0\.78/);
  assert.match(gameSource,/this\.presentation\.emitTelegraph\(\{ x:this\.hero\.pos\.x, y:this\.hero\.pos\.y, radius, color, ttl:\.55/);
  assert.match(gameSource,/this\.feedback\.addImpact\(this\.hero\.pos, pattern\.kind === 'shockwave' \? 'awakened' : 'final'\)/);
  assert.match(gameSource,/this\.showEventToast\(`\$\{link\.label\} · 최종형 연계`\)/);
});

test('phase 2485 game initializes final form world atlas independently and fail-open',()=>{
  assert.match(gameSource,/initializeFinalFormWorldVfxAtlas/);
  assert.match(gameSource,/finalFormWorldVfxAtlasImage/);
  assert.match(gameSource,/finalFormWorldVfxAtlasReady/);
});

test('phase 2486 final form world VFX audit is deterministic release-bound and presentation-only',async()=>{
  const mod=await importRequired('../src/game/final-form-world-vfx-audit.ts','../dist/game/final-form-world-vfx-audit.js');
  const audit=mod.runFinalFormWorldVfxAudit();
  assert.equal(audit.samples.length,64); assert.equal(audit.actionCount,9); assert.equal(audit.presentationOnly,true); assert.equal(audit.gameplayFormulaMutation,false); assert.equal(audit.snapshotSchemaMutation,false); assert.equal(audit.loadFailureBlocksGameplay,false); assert.equal(audit.passed,true);
  assert.match(freezeSource,/finalFormWorldVfxPassed/); assert.match(candidateSource,/finalFormWorldVfxPassed/); assert.match(candidateSource,/final-form-world-vfx/);
});
