import test from 'node:test'; import assert from 'node:assert/strict';
import { BossEncounterSystem } from '../dist/game/boss-encounters.js';
import { BOSS_COUNTERPLAY_BENEFIT_IDENTITY_ATLAS,BOSS_COUNTERPLAY_BENEFIT_IDENTITY_IDS,bossCounterplayBenefitIdentityIcon,bossCounterplayBenefitActive,auditBossCounterplayBenefitIdentityAtlas } from '../dist/game/boss-counterplay-benefit-identity-assets.js';

test('phase 2152 provides six static counterplay benefit identities driven by real encounter modifiers',()=>{
  assert.equal(BOSS_COUNTERPLAY_BENEFIT_IDENTITY_IDS.length,6);
  assert.deepEqual(BOSS_COUNTERPLAY_BENEFIT_IDENTITY_ATLAS,{src:'./assets/bosses/boss-counterplay-benefit-icons.png',columns:3,rows:2,cellSize:96,width:288,height:192});
  for(const id of BOSS_COUNTERPLAY_BENEFIT_IDENTITY_IDS){const icon=bossCounterplayBenefitIdentityIcon(id);assert.equal(icon.archetype,id);assert.equal(icon.persistentRecallIdentitySupported,true);assert.equal(icon.animated,false);assert.equal(icon.motionAmplitude,0);assert.equal(icon.textFallbackPreserved,true);assert.equal(icon.loadFailureBlocksGameplay,false);const e=new BossEncounterSystem();e.begin(7,id,{x:800,y:450},0);assert.equal(bossCounterplayBenefitActive(id,e.modifiers),false);for(const node of [...e.nodes])e.hitMagic(node.pos,99999);assert.equal(bossCounterplayBenefitActive(id,e.modifiers),true);if(id==='inferno'){e.update(6.01);assert.equal(bossCounterplayBenefitActive(id,e.modifiers),false);}}
  const audit=auditBossCounterplayBenefitIdentityAtlas(); assert.equal(audit.coverage,1); assert.equal(audit.uniqueCellCount,6); assert.deepEqual(audit.outOfBounds,[]); assert.equal(audit.passed,true);
});
