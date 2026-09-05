import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const assetsUrl=new URL('../dist/game/build-overdrive-effect-identity-assets.js',import.meta.url);

test('phase 2295 provides seven static build overdrive effect identities',async()=>{
  assert.equal(fs.existsSync(assetsUrl),true,'build overdrive effect identity module must exist');
  const m=await import(assetsUrl.href);
  assert.deepEqual(m.BUILD_OVERDRIVE_EFFECT_IDS,['spellPower','cooldown','area','heroGuard','coreGuard','bossDamage','fusionPower']);
  assert.deepEqual(m.BUILD_OVERDRIVE_EFFECT_ATLAS,{src:'./assets/ui/build-overdrive-effect-icons.png',columns:4,rows:2,cellSize:96,width:384,height:192});
  const a=m.auditBuildOverdriveEffectIdentityAtlas();
  assert.equal(a.coverage,1);assert.equal(a.uniqueCellCount,7);assert.deepEqual(a.outOfBounds,[]);assert.equal(a.passed,true);
  for(const id of m.BUILD_OVERDRIVE_EFFECT_IDS){const icon=m.buildOverdriveEffectIdentityIcon(id);assert.equal(icon.animated,false);assert.equal(icon.motionAmplitude,0);assert.equal(icon.textFallbackPreserved,true);assert.equal(icon.loadFailureBlocksGameplay,false);}
});

test('phase 2296 effect identities reuse the frozen four build archetypes without adding a fifth archetype',()=>{
  const source=fs.readFileSync(new URL('../src/game/endless/build-overdrive.ts',import.meta.url),'utf8');
  assert.match(source,/export type BuildArchetype = 'burst' \| 'cycle' \| 'domain' \| 'fortress'/);
  assert.doesNotMatch(source,/BuildArchetype[^\n]*'support'|BuildArchetype[^\n]*'hybrid'/);
});
