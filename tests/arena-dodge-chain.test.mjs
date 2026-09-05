import test from 'node:test';
import assert from 'node:assert/strict';
import { createArenaDodgeChain, recordArenaDodgeChain, breakArenaDodgeChain, arenaDodgeChainReward } from '../dist/game/endless/arena-dodge-chain.js';

test('perfect evade chain grows only inside the combo window and caps at five',()=>{
  let s=createArenaDodgeChain();
  for(const t of [1000,2400,3800,5200,6600,8000]) s=recordArenaDodgeChain(s,t);
  assert.equal(s.count,5);
  assert.ok(s.expiresAtMs>8000);
  s=recordArenaDodgeChain(s,13000);
  assert.equal(s.count,1);
});

test('active hazard hit breaks the evade chain',()=>{
  let s=recordArenaDodgeChain(createArenaDodgeChain(),1000);
  s=recordArenaDodgeChain(s,2000);
  assert.equal(s.count,2);
  s=breakArenaDodgeChain(s);
  assert.deepEqual(s,createArenaDodgeChain());
});

test('chain reward remains combat-tempo only and bounded',()=>{
  const one=arenaDodgeChainReward(1),five=arenaDodgeChainReward(5);
  assert.ok(five.flowRetentionBonusMs>one.flowRetentionBonusMs);
  assert.ok(five.signatureChargeBonus>one.signatureChargeBonus);
  assert.ok(five.moveSpeedBonusMultiplier<=1.04);
  assert.ok(five.flowRetentionBonusMs<=900);
  assert.equal('gold' in five,false);
});
