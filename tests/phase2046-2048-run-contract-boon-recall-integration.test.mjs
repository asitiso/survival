import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ACTION_BUTTONS } from '../dist/game/config.js';
import {
  acceptContract, advanceContract, contractOfferTimeMs, createContractOffer, createDefaultContractState, getContractModifiers,
} from '../dist/game/endless/contracts.js';

const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const legacy=(elapsedMs,overrides={})=>({heroId:'arkan',elapsedMs,level:30,threat:5,kills:500,bossesDefeated:5,elitesDefeated:20,gold:1000,xp:10000,guardianCoreHp:1000,guardianCoreMaxHp:1000,fate:'frenzy',spellFusionCount:2,mapEvolutionRank:2,masteryLevel:20,deviceClass:'high',...overrides});

test('phase 2046-2048 Game adds contract identity to accept success failure and compact active boon recall while preserving text fallback',()=>{
  assert.match(source,/eventToastContractFamily/);
  assert.match(source,/런 계약 수락 · \$\{card\.title\}[\s\S]*card\.family/);
  assert.match(source,/contract_reward[\s\S]*런 계약 성공 · 90초 강화 획득[\s\S]*activeRunContractBoonRecall/);
  assert.match(source,/contract_failed[\s\S]*런 계약 실패 · 다음 계약을 노리세요[\s\S]*effect\.family/);
  assert.match(source,/drawRunContractToastIcon\(ctx\)/);
  assert.match(source,/drawRunContractBoonRecall\(ctx,this\.endlessState\.contracts\.boons,this\.elapsed\*1000/);
  assert.match(source,/remainingSeconds/);
  assert.match(source,/ctx\.fillText\(this\.eventToast, 800, 841\)/);
});

test('phase 2046-2048 contract schedule choice failure boon duration modifiers and action count remain unchanged',()=>{
  assert.deepEqual([0,1,2,3,4,5].map(i=>contractOfferTimeMs(i)),[4,9,14,19,26,33].map(m=>m*60_000));
  const offered=createContractOffer(legacy(4*60_000),createDefaultContractState(),{seed:29,cursor:0});
  assert.equal(offered.offer.options.length,3); assert.equal(new Set(offered.offer.options.map(x=>x.family)).size,3);
  const slayer=offered.offer.options.find(x=>x.family==='slayer') ?? {optionId:'contract-offer-1:slayer',family:'slayer',title:'Slayer Contract',description:'',target:1,durationMs:45_000};
  const forced={...offered.state,pendingOffer:{...offered.offer,options:[slayer,offered.offer.options[0],offered.offer.options[1]]}};
  const accepted=acceptContract(forced,slayer.optionId,240_000,1000);
  const done=advanceContract({...accepted,active:{...accepted.active,target:1}},legacy(250_000),[{type:'enemy_killed'}],10_000);
  assert.equal(done.state.boons.at(-1)?.family,'slayer'); assert.equal(done.state.boons.at(-1)?.expiresAtMs,340_000);
  assert.deepEqual(getContractModifiers({...createDefaultContractState(),boons:[{family:'slayer',expiresAtMs:1000}]},0),{xpMultiplier:1.12,masteryMultiplier:1.08,goldMultiplier:1,coreDamageTakenMultiplier:1,cooldownMultiplier:1,bossDamageMultiplier:1,fusionPowerMultiplier:1,potionEfficiency:1});
  assert.deepEqual(getContractModifiers({...createDefaultContractState(),boons:[{family:'warden',expiresAtMs:1000}]},0),{xpMultiplier:1,masteryMultiplier:1,goldMultiplier:1,coreDamageTakenMultiplier:0.88,cooldownMultiplier:1,bossDamageMultiplier:1,fusionPowerMultiplier:1,potionEfficiency:1.1});
  assert.deepEqual(getContractModifiers({...createDefaultContractState(),boons:[{family:'arcane',expiresAtMs:1000}]},0),{xpMultiplier:1,masteryMultiplier:1,goldMultiplier:1,coreDamageTakenMultiplier:1,cooldownMultiplier:0.92,bossDamageMultiplier:1,fusionPowerMultiplier:1.1,potionEfficiency:1});
  assert.deepEqual(getContractModifiers({...createDefaultContractState(),boons:[{family:'hunter',expiresAtMs:1000}]},0),{xpMultiplier:1,masteryMultiplier:1,goldMultiplier:1.15,coreDamageTakenMultiplier:1,cooldownMultiplier:1,bossDamageMultiplier:1.08,fusionPowerMultiplier:1,potionEfficiency:1});
  assert.deepEqual(getContractModifiers({...createDefaultContractState(),boons:[{family:'survivor',expiresAtMs:1000}]},0),{xpMultiplier:1,masteryMultiplier:1,goldMultiplier:1,coreDamageTakenMultiplier:0.92,cooldownMultiplier:1,bossDamageMultiplier:1,fusionPowerMultiplier:1,potionEfficiency:1.15});
  assert.equal(ACTION_BUTTONS.length,9);
});
