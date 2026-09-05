import test from 'node:test';
import assert from 'node:assert/strict';
import { mythicArenaHazardContact } from '../dist/game/endless/mythic-arena-collision.js';

const base={pos:{x:500,y:400},radius:100,angle:0,length:400,damage:20};

test('ring collision respects hollow center instead of treating the whole circle as damage',()=>{
  const ring={...base,geometryShape:'ring'};
  assert.equal(mythicArenaHazardContact(ring,{x:500,y:400},18).hit,false);
  assert.equal(mythicArenaHazardContact(ring,{x:585,y:400},18).hit,true);
});

test('corridor and cross collision follow rendered lane geometry',()=>{
  const corridor={...base,geometryShape:'corridor',radius:32,length:420};
  assert.equal(mythicArenaHazardContact(corridor,{x:680,y:425},14).hit,true);
  assert.equal(mythicArenaHazardContact(corridor,{x:500,y:500},14).hit,false);
  const cross={...base,geometryShape:'cross',radius:30,length:360};
  assert.equal(mythicArenaHazardContact(cross,{x:500,y:545},12).hit,true);
});

test('clock wedge only hits inside its narrow radial sector and returns bounded response',()=>{
  const clock={...base,geometryShape:'clock',radius:100,angle:0};
  const hit=mythicArenaHazardContact(clock,{x:590,y:405},12);
  assert.equal(hit.hit,true);
  assert.ok(hit.slowMultiplier>=0.78&&hit.slowMultiplier<=1);
  assert.ok(Math.hypot(hit.push.x,hit.push.y)<=1.001);
  assert.equal(mythicArenaHazardContact(clock,{x:500,y:500},12).hit,false);
});
