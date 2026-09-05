import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const requirementUrl=new URL('../dist/game/oath-requirement-identity-assets.js',import.meta.url);
const boonUrl=new URL('../dist/game/oath-boon-outcome-identity-assets.js',import.meta.url);

test('phase 2231 provides six static long-run oath requirement identities',async()=>{
  assert.equal(fs.existsSync(requirementUrl),true,'oath requirement module must exist');
  const m=await import(requirementUrl.href);
  assert.deepEqual(m.OATH_REQUIREMENT_IDENTITY_IDS,['slayer','elite_hunt','boss_hunt','arcane_flow','core_guard','endure']);
  assert.deepEqual(m.OATH_REQUIREMENT_IDENTITY_ATLAS,{src:'./assets/ui/oath-requirement-icons.png',columns:3,rows:2,cellSize:96,width:288,height:192});
  for(const id of m.OATH_REQUIREMENT_IDENTITY_IDS){const icon=m.oathRequirementIdentityIcon(id);assert.equal(icon.animated,false);assert.equal(icon.motionAmplitude,0);assert.equal(icon.textFallbackPreserved,true);assert.equal(icon.loadFailureBlocksGameplay,false);}
  const a=m.auditOathRequirementIdentityAtlas();assert.equal(a.coverage,1);assert.equal(a.uniqueCellCount,6);assert.deepEqual(a.outOfBounds,[]);assert.equal(a.passed,true);
});

test('phase 2232 provides four static long-run oath boon outcome identities',async()=>{
  assert.equal(fs.existsSync(boonUrl),true,'oath boon module must exist');
  const m=await import(boonUrl.href);
  assert.deepEqual(m.OATH_BOON_OUTCOME_IDENTITY_IDS,['prosperity','power','guard','boss']);
  assert.deepEqual(m.OATH_BOON_OUTCOME_IDENTITY_ATLAS,{src:'./assets/ui/oath-boon-outcome-icons.png',columns:4,rows:1,cellSize:96,width:384,height:96});
  for(const id of m.OATH_BOON_OUTCOME_IDENTITY_IDS){const icon=m.oathBoonOutcomeIdentityIcon(id);assert.equal(icon.animated,false);assert.equal(icon.motionAmplitude,0);assert.equal(icon.textFallbackPreserved,true);assert.equal(icon.loadFailureBlocksGameplay,false);}
  const a=m.auditOathBoonOutcomeIdentityAtlas();assert.equal(a.coverage,1);assert.equal(a.uniqueCellCount,4);assert.deepEqual(a.outOfBounds,[]);assert.equal(a.passed,true);
});
