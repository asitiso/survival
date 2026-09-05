import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const statusUrl=new URL('../dist/game/generic-upgrade-gain-status-identity-assets.js',import.meta.url);

test('phase 2287 provides three static effective-gain status identities',async()=>{
  assert.equal(fs.existsSync(statusUrl),true,'generic upgrade gain status identity module must exist');
  const m=await import(statusUrl.href);
  assert.deepEqual(m.GENERIC_UPGRADE_GAIN_STATUS_IDS,['full','diminished','capped']);
  assert.deepEqual(m.GENERIC_UPGRADE_GAIN_STATUS_ATLAS,{src:'./assets/ui/generic-upgrade-gain-status-icons.png',columns:3,rows:1,cellSize:96,width:288,height:96});
  assert.equal(m.genericUpgradeGainStatusIdentityIcon('full').label,'정상 효율');
  assert.equal(m.genericUpgradeGainStatusIdentityIcon('diminished').label,'감소 효율');
  assert.equal(m.genericUpgradeGainStatusIdentityIcon('capped').label,'상한 도달');
  const a=m.auditGenericUpgradeGainStatusIdentityAtlas();
  assert.equal(a.coverage,1);assert.equal(a.uniqueCellCount,3);assert.deepEqual(a.outOfBounds,[]);assert.equal(a.passed,true);
  for(const id of m.GENERIC_UPGRADE_GAIN_STATUS_IDS){const icon=m.genericUpgradeGainStatusIdentityIcon(id);assert.equal(icon.animated,false);assert.equal(icon.motionAmplitude,0);assert.equal(icon.textFallbackPreserved,true);assert.equal(icon.loadFailureBlocksGameplay,false);}
});

test('phase 2288 keeps the existing growth-choice identity as the stat identity instead of duplicating it',()=>{
  const source=fs.readFileSync(new URL('../src/game/growth-choice-icon-assets.ts',import.meta.url),'utf8');
  for(const id of ['maxHp','moveSpeed','spellPower','cooldown','pickupRadius'])assert.match(source,new RegExp(`\\b${id}\\b`));
});
