import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const gameSource=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const fusionSource=fs.readFileSync(new URL('../src/game/fusion-integration.ts',import.meta.url),'utf8');
const freezeSource=fs.readFileSync(new URL('../src/game/release-freeze-audit.ts',import.meta.url),'utf8');
const candidateSource=fs.readFileSync(new URL('../src/game/release-candidate-audit.ts',import.meta.url),'utf8');
function pngDimensions(buffer){assert.equal(buffer.toString('ascii',1,4),'PNG');return{width:buffer.readUInt32BE(16),height:buffer.readUInt32BE(20)};}
async function importRequired(sourceRelative,distRelative){assert.equal(fs.existsSync(new URL(sourceRelative,import.meta.url)),true,`${sourceRelative} must exist`);return import(distRelative);}

test('phase 2487 fusion world atlas covers six fusion procs x proc aftershock states',async()=>{
  const mod=await importRequired('../src/game/fusion-world-vfx-assets.ts','../dist/game/fusion-world-vfx-assets.js');
  const audit=mod.auditFusionWorldVfxAtlas();
  assert.equal(mod.FUSION_WORLD_VFX_IDS.length,6); assert.deepEqual(mod.FUSION_WORLD_VFX_STATES,['proc','aftershock']);
  assert.equal(audit.fusionCount,6); assert.equal(audit.stateCount,2); assert.equal(audit.itemCount,12); assert.equal(audit.uniqueCellCount,12); assert.equal(audit.passed,true);
  const buffer=fs.readFileSync(path.resolve(mod.FUSION_WORLD_VFX_ATLAS.src.replace(/^\.\//,'')));
  assert.deepEqual(pngDimensions(buffer),{width:768,height:256}); assert.ok(buffer.length>8000);
});

test('phase 2488 actual fusion proc queues world VFX while existing proc eligibility remains component-based',()=>{
  assert.match(gameSource,/queueFusionWorldVfx\(fusionId, origin\)/);
  assert.match(gameSource,/for \(const fusionId of fusionProcs\) if \(this\.fusionRuntime\.tryTrigger\(fusionId\)\) this\.triggerFusionProc\(fusionId\)/);
  assert.match(fusionSource,/return equipped\.filter\(\(id\) => fusionAffectsSpell\(id, spellId\)\)/);
});

test('phase 2489 fusion proc and aftershock states share one bounded presentation queue',()=>{
  assert.match(gameSource,/fusionWorldVfx\.length > 32/);
  assert.match(gameSource,/fusionWorldVfxSprite\(vfx\.fusionId,state\)/);
  assert.match(gameSource,/state = progress < 0\.48 \? 'proc' : 'aftershock'/);
});

test('phase 2490 fusion world VFX preserves fusion damage and radius contracts',()=>{
  assert.match(gameSource,/drawFusionWorldVfx/);
  assert.match(gameSource,/const damage = 52 \* this\.hero\.spellPower \* this\.hero\.equipmentSpellPower/);
  assert.match(gameSource,/distance\(enemy\.pos, origin\) > 105 \+ enemy\.radius/);
  assert.match(gameSource,/this\.feedback\.addImpact\(origin, 'awakened'\)/);
});

test('phase 2491 fusion world atlas loads independently with legacy toast fallback preserved',()=>{
  assert.match(gameSource,/initializeFusionWorldVfxAtlas/); assert.match(gameSource,/fusionWorldVfxAtlasImage/); assert.match(gameSource,/fusionWorldVfxAtlasReady/);
  assert.match(gameSource,/this\.showBuildIdentityEventToast\(`융합 발동 · \$\{fusionDefinition\(fusionId\)\.name\}`/);
});

test('phase 2492 fusion world VFX audit is deterministic release-bound and presentation-only',async()=>{
  const mod=await importRequired('../src/game/fusion-world-vfx-audit.ts','../dist/game/fusion-world-vfx-audit.js'); const audit=mod.runFusionWorldVfxAudit();
  assert.equal(audit.samples.length,64); assert.equal(audit.actionCount,9); assert.equal(audit.presentationOnly,true); assert.equal(audit.gameplayFormulaMutation,false); assert.equal(audit.snapshotSchemaMutation,false); assert.equal(audit.loadFailureBlocksGameplay,false); assert.equal(audit.passed,true);
  assert.match(freezeSource,/fusionWorldVfxPassed/); assert.match(candidateSource,/fusionWorldVfxPassed/); assert.match(candidateSource,/fusion-world-vfx/);
});
