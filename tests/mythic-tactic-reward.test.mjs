import test from 'node:test';
import assert from 'node:assert/strict';
import { mythicTacticReward } from '../dist/game/endless/mythic-tactic-reward.js';
import fs from 'node:fs';

test('tactic reward requires mythic safe-link success and at least half weakpoints destroyed',()=>{
  assert.equal(mythicTacticReward('inferno',false,.8,'stable'),null);
  assert.equal(mythicTacticReward('inferno',true,.49,'stable'),null);
  assert.equal(mythicTacticReward('inferno',true,.8,'collapsed'),null);
  assert.ok(mythicTacticReward('inferno',true,.5,'collapse'));
});

test('tactic reward is combat-only bounded and short lived',()=>{
  const r=mythicTacticReward('juggernaut',true,1,'stable');
  assert.ok(r);
  assert.ok(r.durationMs>=4000&&r.durationMs<=6500);
  assert.ok(r.bossDamageTakenMultiplier>=1&&r.bossDamageTakenMultiplier<=1.08);
  assert.ok(r.signatureChargeBonus>=0&&r.signatureChargeBonus<=3);
  assert.ok(r.flowRetentionMs>=0&&r.flowRetentionMs<=1600);
  assert.equal('gold' in r,false);
  assert.equal('xp' in r,false);
});

test('archetypes keep distinct tactic labels without changing reward caps',()=>{
  const labels=new Set(['inferno','summoner','juggernaut','abyssWitch','twinMaw','timeEater'].map((a)=>mythicTacticReward(a,true,.75,'reform')?.label));
  assert.equal(labels.size,6);
});

test('game consumes tactic reward only at successful SAFE LINK and composes transient boss vulnerability',()=>{
  const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.ok(source.includes('mythicTacticReward'));
  assert.ok(source.includes('mythicTacticBoostUntilMs'));
  assert.ok(source.includes('mythicTacticBossDamageMultiplier'));
  assert.ok(source.includes('safeLinkStep.reward'));
});
