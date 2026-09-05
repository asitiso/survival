import test from 'node:test';
import assert from 'node:assert/strict';
import { arenaDodgeFinisherProfile, shouldTriggerArenaDodgeFinisher } from '../dist/game/endless/arena-dodge-finisher.js';

test('perfect evade finisher edge-triggers only when chain first reaches five',()=>{
  assert.equal(shouldTriggerArenaDodgeFinisher(4,5),true);
  assert.equal(shouldTriggerArenaDodgeFinisher(5,5),false);
  assert.equal(shouldTriggerArenaDodgeFinisher(0,1),false);
  assert.equal(shouldTriggerArenaDodgeFinisher(5,1),false);
});

test('finisher is a bounded combat payoff with no economy reward',()=>{
  const f=arenaDodgeFinisherProfile();
  assert.equal(f.label,'EVADE FINISH');
  assert.ok(f.radius>=120&&f.radius<=220);
  assert.ok(f.damageMultiplier>=.5&&f.damageMultiplier<=1.25);
  assert.ok(f.pushDistance<=48);
  assert.ok(f.slowDuration<=1.2);
  assert.ok(f.signatureChargeBonus<=6);
  assert.equal('gold' in f,false);
  assert.equal('xp' in f,false);
});

import fs from 'node:fs';
const gameSource=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
test('game consumes the x5 finisher at the existing perfect evade seam',()=>{
  assert.ok(gameSource.includes('shouldTriggerArenaDodgeFinisher'));
  assert.ok(gameSource.includes('arenaDodgeFinisherProfile'));
  assert.ok(gameSource.includes('showEventToast(`${finisher.label}'));
});
