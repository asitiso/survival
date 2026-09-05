import test from 'node:test';
import assert from 'node:assert/strict';
import { mythicSafeLaneHint } from '../dist/game/endless/mythic-safe-lane.js';

const hero={x:800,y:450};
const corridor={id:1,pos:{x:800,y:450},radius:80,damage:20,telegraph:.5,ttl:3,geometryShape:'corridor',angle:0,length:600};
const ring={id:2,pos:{x:800,y:450},radius:180,damage:20,telegraph:.5,ttl:3,geometryShape:'ring',angle:0,length:540};

test('safe lane hint deterministically points away from corridor pressure',()=>{
  const a=mythicSafeLaneHint([corridor],hero,20,1600,900);
  const b=mythicSafeLaneHint([corridor],hero,20,1600,900);
  assert.deepEqual(a,b);
  assert.ok(a);
  assert.ok(Math.abs(a.target.y-hero.y)>Math.abs(a.target.x-hero.x));
  assert.ok(a.confidence>0&&a.confidence<=1);
});

test('ring hint prefers the safe inner pocket when hero is on the ring band',()=>{
  const hint=mythicSafeLaneHint([ring],{x:960,y:450},20,1600,900);
  assert.ok(hint);
  assert.ok(hint.target.x<960);
  assert.equal(hint.label,'SAFE LANE');
});

test('no active geometry returns no guidance',()=>{
  assert.equal(mythicSafeLaneHint([],hero,20,1600,900),null);
});
