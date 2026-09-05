import test from 'node:test';
import assert from 'node:assert/strict';
import { mythicSafeZoneState } from '../dist/game/endless/mythic-safe-zone.js';
import { mythicSafeZonePressure } from '../dist/game/endless/mythic-safe-zone-pressure.js';

function pressure(archetype,ms,destroyed=.25){
  return mythicSafeZonePressure(archetype,mythicSafeZoneState(archetype,ms,1600,900,destroyed),destroyed);
}

test('safe zone lifecycle creates a readable pressure valley and collapsed peak',()=>{
  const stable=pressure('inferno',1000);
  const collapse=pressure('inferno',5200);
  const collapsed=pressure('inferno',7000);
  const reform=pressure('inferno',8400);
  assert.ok(stable.specialCadenceMultiplier>collapse.specialCadenceMultiplier);
  assert.ok(collapse.specialCadenceMultiplier>collapsed.specialCadenceMultiplier);
  assert.ok(collapsed.summonCountMultiplier>=collapse.summonCountMultiplier);
  assert.ok(collapsed.dashDistanceMultiplier>=collapse.dashDistanceMultiplier);
  assert.ok(reform.specialCadenceMultiplier>collapse.specialCadenceMultiplier);
});

test('destroying weakpoints reduces peak safe-zone pressure',()=>{
  const raw=pressure('summoner',7000,0);
  const cleared=pressure('summoner',7000,1);
  assert.ok(cleared.specialCadenceMultiplier>raw.specialCadenceMultiplier);
  assert.ok(cleared.summonCountMultiplier<raw.summonCountMultiplier);
  assert.ok(cleared.dashDistanceMultiplier<=raw.dashDistanceMultiplier);
});

test('archetype identity biases the synchronized pressure channel',()=>{
  const summoner=pressure('summoner',7000,0);
  const juggernaut=pressure('juggernaut',7000,0);
  const time=pressure('timeEater',7000,0);
  assert.ok(summoner.summonCountMultiplier>juggernaut.summonCountMultiplier);
  assert.ok(juggernaut.dashDistanceMultiplier>summoner.dashDistanceMultiplier);
  assert.ok(time.specialCadenceMultiplier<=juggernaut.specialCadenceMultiplier);
});

test('all pressure multipliers stay within bounded combat caps',()=>{
  for(const archetype of ['inferno','summoner','juggernaut','abyssWitch','twinMaw','timeEater'])for(const ms of [1000,5200,7000,8400]){
    const p=pressure(archetype,ms,.4);
    assert.ok(p.specialCadenceMultiplier>=.78&&p.specialCadenceMultiplier<=1.16);
    assert.ok(p.summonCountMultiplier>=.86&&p.summonCountMultiplier<=1.18);
    assert.ok(p.dashDistanceMultiplier>=.86&&p.dashDistanceMultiplier<=1.18);
    assert.ok(p.bossDamageTakenMultiplier>=.98&&p.bossDamageTakenMultiplier<=1.06);
  }
});

import fs from 'node:fs';
const gameSource=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('game composes safe-zone pressure into the existing boss modifier chain',()=>{
  assert.ok(gameSource.includes('mythicSafeZonePressure'));
  assert.ok(gameSource.includes('safeZonePressure.specialCadenceMultiplier'));
  assert.ok(gameSource.includes('safeZonePressure.summonCountMultiplier'));
  assert.ok(gameSource.includes('safeZonePressure.dashDistanceMultiplier'));
});
