import test from 'node:test';
import assert from 'node:assert/strict';
import { createSafeLaneLink, advanceSafeLaneLink, consumeSafeLanePerfectEvade } from '../dist/game/endless/safe-lane-link.js';

const hint={label:'SAFE LANE',target:{x:100,y:100},confidence:.8,score:50};

test('safe lane link arms only after the hero reaches the hinted safe target',()=>{
  let s=createSafeLaneLink();
  s=advanceSafeLaneLink(s,{x:20,y:20},hint,1000);
  assert.equal(s.armedUntilMs,0);
  s=advanceSafeLaneLink(s,{x:108,y:104},hint,1200);
  assert.ok(s.armedUntilMs>1200);
});

test('armed safe lane converts the next perfect evade into a bounded final form reward',()=>{
  let s=advanceSafeLaneLink(createSafeLaneLink(),{x:100,y:100},hint,1000);
  const consumed=consumeSafeLanePerfectEvade(s,'tempest-runner',1500);
  assert.ok(consumed.reward);
  assert.equal(consumed.reward.label,'SAFE LINK');
  assert.ok(consumed.reward.flowStackBonus>=1&&consumed.reward.flowStackBonus<=2);
  assert.ok(consumed.reward.signatureChargeBonus<=3);
  assert.ok(consumed.reward.moveSpeedMultiplier<=1.05);
  assert.equal(consumed.state.armedUntilMs,0);
});

test('safe lane link expires quickly and never auto-moves the hero',()=>{
  let s=advanceSafeLaneLink(createSafeLaneLink(),{x:100,y:100},hint,1000);
  const expired=consumeSafeLanePerfectEvade(s,'solar-sovereign',4000);
  assert.equal(expired.reward,null);
  assert.equal('target' in expired.state,false);
  assert.equal('heroPos' in expired.state,false);
});

import fs from 'node:fs';
const gameSource=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
test('game arms and consumes safe lane link at the existing arena dodge seam',()=>{
  assert.ok(gameSource.includes('advanceSafeLaneLink'));
  assert.ok(gameSource.includes('consumeSafeLanePerfectEvade'));
  assert.ok(gameSource.includes('SAFE LINK'));
});

test('game applies SAFE LINK signature charge exactly once per consumed evade',()=>{
  const needle='charge:clamp(this.endlessState.signature.charge + safeReward.signatureChargeBonus,0,100)';
  assert.equal(gameSource.split(needle).length-1,1);
});
