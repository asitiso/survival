import test from 'node:test';
import assert from 'node:assert/strict';
import { mythicSafeZoneState, mythicSafeZoneDamageMultiplier } from '../dist/game/endless/mythic-safe-zone.js';
import { mythicSafeLaneHint } from '../dist/game/endless/mythic-safe-lane.js';

const archetypes=['inferno','summoner','juggernaut','abyssWitch','twinMaw','timeEater'];

test('each mythic archetype cycles stable collapse collapsed and reform deterministically',()=>{
  for(const archetype of archetypes){
    const states=[1000,5400,6800,8200].map((t)=>mythicSafeZoneState(archetype,t,1600,900,.25));
    assert.deepEqual(states.map((s)=>s.phase),['stable','collapse','collapsed','reform'],archetype);
    assert.deepEqual(mythicSafeZoneState(archetype,1000,1600,900,.25),states[0]);
  }
});

test('safe zones stay on-screen and destroyed weakpoints make recovery slightly more generous',()=>{
  for(const archetype of archetypes){
    const base=mythicSafeZoneState(archetype,1000,1600,900,0);
    const weak=mythicSafeZoneState(archetype,1000,1600,900,1);
    for(const s of [base,weak]){
      assert.ok(s.center.x>=80&&s.center.x<=1520);
      assert.ok(s.center.y>=120&&s.center.y<=820);
      assert.ok(s.radius>=48&&s.radius<=150);
    }
    assert.ok(weak.radius>=base.radius);
  }
});

test('safe lane prefers an active safe zone but never overrides real hazard collision',()=>{
  const hazard={id:1,pos:{x:420,y:450},radius:90,damage:20,telegraph:0,ttl:3,geometryShape:'corridor',angle:Math.PI/2,length:500};
  const preferred={target:{x:1220,y:450},radius:86,weight:95};
  const hint=mythicSafeLaneHint([hazard],{x:800,y:450},20,1600,900,preferred);
  assert.ok(hint);
  assert.ok(hint.target.x>900);
  const dangerous={target:{x:420,y:450},radius:86,weight:500};
  const safe=mythicSafeLaneHint([hazard],{x:800,y:450},20,1600,900,dangerous);
  assert.ok(safe);
  assert.ok(Math.hypot(safe.target.x-420,safe.target.y-450)>100);
});

test('reform previews the next safe zone position before the next stable cycle',()=>{
  const reform=mythicSafeZoneState('twinMaw',8200,1600,900,.4);
  const next=mythicSafeZoneState('twinMaw',9000,1600,900,.4);
  assert.deepEqual(reform.center,next.center);
});

import fs from 'node:fs';
const gameSource=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
test('game feeds the mythic safe zone into SAFE LANE scoring and renders its lifecycle',()=>{
  assert.ok(gameSource.includes('mythicSafeZoneState'));
  assert.ok(gameSource.includes('safeZone.preferenceWeight'));
  assert.ok(gameSource.includes("safeZone.phase === 'collapse'"));
});


test('stable safe zone materially protects the hero while collapsed zone does not',()=>{
  const stable=mythicSafeZoneState('inferno',1000,1600,900,0);
  const collapsed=mythicSafeZoneState('inferno',6800,1600,900,0);
  assert.ok(mythicSafeZoneDamageMultiplier(stable,stable.center)<=.25);
  assert.equal(mythicSafeZoneDamageMultiplier(stable,{x:80,y:800}),1);
  assert.equal(mythicSafeZoneDamageMultiplier(collapsed,collapsed.center),1);
});
