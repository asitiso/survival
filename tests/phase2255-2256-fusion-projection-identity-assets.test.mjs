import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const modifierUrl=new URL('../dist/game/fusion-modifier-identity-assets.js',import.meta.url);
const relationUrl=new URL('../dist/game/fusion-component-relation-identity-assets.js',import.meta.url);

test('phase 2255 provides seven static fusion modifier identities',async()=>{
  assert.equal(fs.existsSync(modifierUrl),true,'fusion modifier identity module must exist');
  const m=await import(modifierUrl.href);
  assert.deepEqual(m.FUSION_MODIFIER_IDENTITY_IDS,['damage','area','cooldown','chain','pierce','slow-duration','tick-power']);
  assert.deepEqual(m.FUSION_MODIFIER_IDENTITY_ATLAS,{src:'./assets/ui/fusion-modifier-icons.png',columns:4,rows:2,cellSize:96,width:384,height:192});
  const a=m.auditFusionModifierIdentityAtlas();
  assert.equal(a.coverage,1);assert.equal(a.uniqueCellCount,7);assert.deepEqual(a.outOfBounds,[]);assert.equal(a.passed,true);
  for(const id of m.FUSION_MODIFIER_IDENTITY_IDS){const icon=m.fusionModifierIdentityIcon(id);assert.equal(icon.animated,false);assert.equal(icon.motionAmplitude,0);assert.equal(icon.textFallbackPreserved,true);assert.equal(icon.loadFailureBlocksGameplay,false);}
});

test('phase 2256 exposes only the two component relations that can actually occur',async()=>{
  assert.equal(fs.existsSync(relationUrl),true,'fusion relation identity module must exist');
  const m=await import(relationUrl.href);
  assert.deepEqual(m.FUSION_COMPONENT_RELATION_IDS,['fresh','linked']);
  assert.deepEqual(m.FUSION_COMPONENT_RELATION_ATLAS,{src:'./assets/ui/fusion-component-relation-icons.png',columns:2,rows:1,cellSize:96,width:192,height:96});
  assert.equal(m.fusionComponentRelationIdentityIcon('fresh').label,'신규 조합');
  assert.equal(m.fusionComponentRelationIdentityIcon('linked').label,'1마법 연결');
  const a=m.auditFusionComponentRelationIdentityAtlas();assert.equal(a.coverage,1);assert.equal(a.uniqueCellCount,2);assert.deepEqual(a.outOfBounds,[]);assert.equal(a.passed,true);
});
