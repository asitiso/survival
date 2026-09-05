import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const gameSource=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const meterSource=fs.readFileSync(new URL('../src/game/hero-meters.ts',import.meta.url),'utf8');
const freezeSource=fs.readFileSync(new URL('../src/game/release-freeze-audit.ts',import.meta.url),'utf8');
const candidateSource=fs.readFileSync(new URL('../src/game/release-candidate-audit.ts',import.meta.url),'utf8');
function pngDimensions(buffer){assert.equal(buffer.toString('ascii',1,4),'PNG');return{width:buffer.readUInt32BE(16),height:buffer.readUInt32BE(20)};}
async function importRequired(sourceRelative,distRelative){assert.equal(fs.existsSync(new URL(sourceRelative,import.meta.url)),true,`${sourceRelative} must exist`);return import(distRelative);}

test('phase 2493 hero meter world atlas covers four heroes x activate active states',async()=>{
  const mod=await importRequired('../src/game/hero-meter-world-vfx-assets.ts','../dist/game/hero-meter-world-vfx-assets.js'); const audit=mod.auditHeroMeterWorldVfxAtlas();
  assert.deepEqual(mod.HERO_METER_WORLD_VFX_HEROES,['arkan','seria','kain','edric']); assert.deepEqual(mod.HERO_METER_WORLD_VFX_STATES,['activate','active']);
  assert.equal(audit.heroCount,4); assert.equal(audit.stateCount,2); assert.equal(audit.itemCount,8); assert.equal(audit.uniqueCellCount,8); assert.equal(audit.passed,true);
  const buffer=fs.readFileSync(path.resolve(mod.HERO_METER_WORLD_VFX_ATLAS.src.replace(/^\.\//,'')));
  assert.deepEqual(pngDimensions(buffer),{width:512,height:256}); assert.ok(buffer.length>6000);
});

test('phase 2494 meter activation queues hero-specific burst only on actual activation',()=>{
  assert.match(gameSource,/if \(!transition\.activated\) return/);
  assert.match(gameSource,/queueHeroMeterWorldVfx\(this\.hero\.profileId\)/);
  assert.match(gameSource,/this\.showHeroMeterEventToast\(`\$\{label\.activeName\} 발동!`/);
});

test('phase 2495 active hero meter aura is image-backed while active timer remains source of truth',()=>{
  assert.match(gameSource,/this\.heroMeter\.activeTimer > 0/);
  assert.match(gameSource,/heroMeterWorldVfxSprite\(this\.hero\.profileId,'active'\)/);
  assert.match(gameSource,/drawHeroMeterWorldVfx/);
});

test('phase 2496 meter VFX preserves all four existing modifier contracts',()=>{
  assert.match(gameSource,/heroMeterWorldVfxSprite\(this\.hero\.profileId,'active'\)/);
  assert.match(meterSource,/spellPowerMultiplier: 1\.22, areaMultiplier: 1\.15/);
  assert.match(meterSource,/cooldownMultiplier: 0\.88, areaMultiplier: 1\.22, shatterRadius: 155/);
  assert.match(meterSource,/cooldownMultiplier: 0\.78, spellPowerMultiplier: 1\.08, kainChainBonus: 2/);
  assert.match(meterSource,/coreDamageTakenMultiplier: 0\.72, areaMultiplier: 1\.16/);
});

test('phase 2497 hero meter world atlas loads independently and remains fail-open',()=>{
  assert.match(gameSource,/initializeHeroMeterWorldVfxAtlas/); assert.match(gameSource,/heroMeterWorldVfxAtlasImage/); assert.match(gameSource,/heroMeterWorldVfxAtlasReady/);
  assert.match(gameSource,/this\.feedback\.addImpact\(this\.hero\.pos, 'final'\)/);
});

test('phase 2498 hero meter world VFX audit is deterministic release-bound and presentation-only',async()=>{
  const mod=await importRequired('../src/game/hero-meter-world-vfx-audit.ts','../dist/game/hero-meter-world-vfx-audit.js'); const audit=mod.runHeroMeterWorldVfxAudit();
  assert.equal(audit.samples.length,64); assert.equal(audit.actionCount,9); assert.equal(audit.presentationOnly,true); assert.equal(audit.gameplayFormulaMutation,false); assert.equal(audit.snapshotSchemaMutation,false); assert.equal(audit.loadFailureBlocksGameplay,false); assert.equal(audit.passed,true);
  assert.match(freezeSource,/heroMeterWorldVfxPassed/); assert.match(candidateSource,/heroMeterWorldVfxPassed/); assert.match(candidateSource,/hero-meter-world-vfx/);
});
