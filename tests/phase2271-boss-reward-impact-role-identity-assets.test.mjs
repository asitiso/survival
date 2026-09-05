import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const url=new URL('../dist/game/boss-reward-impact-role-identity-assets.js',import.meta.url);

test('phase 2271 provides five static boss reward impact role identities',async()=>{
  assert.equal(fs.existsSync(url),true,'boss reward impact role identity module must exist');
  const m=await import(url.href);
  assert.deepEqual(m.BOSS_REWARD_IMPACT_ROLE_IDS,['offense','survival','growth','economy','pivot']);
  assert.deepEqual(m.BOSS_REWARD_IMPACT_ROLE_ATLAS,{src:'./assets/ui/boss-reward-impact-role-icons.png',columns:5,rows:1,cellSize:96,width:480,height:96});
  const labels=m.BOSS_REWARD_IMPACT_ROLE_IDS.map(id=>m.bossRewardImpactRoleIdentityIcon(id).label);
  assert.deepEqual(labels,['화력','생존','성장','경제','빌드전환']);
});

test('phase 2271 role atlas is complete unique static and non-blocking',async()=>{
  const m=await import(url.href);const a=m.auditBossRewardImpactRoleIdentityAtlas();
  assert.equal(a.coverage,1);assert.equal(a.uniqueCellCount,5);assert.deepEqual(a.outOfBounds,[]);assert.equal(a.passed,true);
  for(const id of m.BOSS_REWARD_IMPACT_ROLE_IDS){const icon=m.bossRewardImpactRoleIdentityIcon(id);assert.equal(icon.animated,false);assert.equal(icon.motionAmplitude,0);assert.equal(icon.textFallbackPreserved,true);assert.equal(icon.loadFailureBlocksGameplay,false);assert.match(m.bossRewardImpactRoleIdentityStyle(id),/boss-reward-impact-role-icons\.png/);}
});
