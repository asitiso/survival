import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const reqUrl=new URL('../dist/game/run-contract-requirement-identity-assets.js',import.meta.url);
const boonUrl=new URL('../dist/game/run-contract-boon-effect-identity-assets.js',import.meta.url);

test('phase 2215 provides five static run contract requirement identities',async()=>{
  assert.equal(fs.existsSync(reqUrl),true,'requirement identity module must exist');
  const m=await import(reqUrl.href);
  assert.deepEqual(m.RUN_CONTRACT_REQUIREMENT_IDENTITY_IDS,['slayer-kills','warden-core-guard','arcane-casts','hunter-elite','survivor-no-hit']);
  assert.deepEqual(m.RUN_CONTRACT_REQUIREMENT_IDENTITY_ATLAS,{src:'./assets/ui/run-contract-requirement-icons.png',columns:5,rows:1,cellSize:96,width:480,height:96});
  assert.equal(m.runContractRequirementIdentityForFamily('slayer'),'slayer-kills');
  assert.equal(m.runContractRequirementIdentityForFamily('warden'),'warden-core-guard');
  assert.equal(m.runContractRequirementIdentityForFamily('arcane'),'arcane-casts');
  assert.equal(m.runContractRequirementIdentityForFamily('hunter'),'hunter-elite');
  assert.equal(m.runContractRequirementIdentityForFamily('survivor'),'survivor-no-hit');
  for(const id of m.RUN_CONTRACT_REQUIREMENT_IDENTITY_IDS){const icon=m.runContractRequirementIdentityIcon(id);assert.equal(icon.animated,false);assert.equal(icon.motionAmplitude,0);assert.equal(icon.textFallbackPreserved,true);assert.equal(icon.loadFailureBlocksGameplay,false);}
  const a=m.auditRunContractRequirementIdentityAtlas();assert.equal(a.coverage,1);assert.equal(a.uniqueCellCount,5);assert.deepEqual(a.outOfBounds,[]);assert.equal(a.passed,true);
});

test('phase 2216 provides five static run contract boon effect identities',async()=>{
  assert.equal(fs.existsSync(boonUrl),true,'boon effect identity module must exist');
  const m=await import(boonUrl.href);
  assert.deepEqual(m.RUN_CONTRACT_BOON_EFFECT_IDENTITY_IDS,['xp-mastery','core-potion','fusion-cooldown','gold-boss','guard-potion']);
  assert.deepEqual(m.RUN_CONTRACT_BOON_EFFECT_IDENTITY_ATLAS,{src:'./assets/ui/run-contract-boon-effect-icons.png',columns:5,rows:1,cellSize:96,width:480,height:96});
  assert.equal(m.runContractBoonEffectIdentityForFamily('slayer'),'xp-mastery');
  assert.equal(m.runContractBoonEffectIdentityForFamily('warden'),'core-potion');
  assert.equal(m.runContractBoonEffectIdentityForFamily('arcane'),'fusion-cooldown');
  assert.equal(m.runContractBoonEffectIdentityForFamily('hunter'),'gold-boss');
  assert.equal(m.runContractBoonEffectIdentityForFamily('survivor'),'guard-potion');
  for(const id of m.RUN_CONTRACT_BOON_EFFECT_IDENTITY_IDS){const icon=m.runContractBoonEffectIdentityIcon(id);assert.equal(icon.animated,false);assert.equal(icon.motionAmplitude,0);assert.equal(icon.textFallbackPreserved,true);assert.equal(icon.loadFailureBlocksGameplay,false);}
  const a=m.auditRunContractBoonEffectIdentityAtlas();assert.equal(a.coverage,1);assert.equal(a.uniqueCellCount,5);assert.deepEqual(a.outOfBounds,[]);assert.equal(a.passed,true);
});
