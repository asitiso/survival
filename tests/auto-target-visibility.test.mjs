import test from 'node:test';
import assert from 'node:assert/strict';
import { autoTargetIndicator, weakpointIndicator } from '../dist/game/auto-target-visibility.js';

const hero={x:100,y:100},core={x:800,y:450};
const target=(overrides={})=>({id:1,type:'grunt',pos:{x:180,y:100},target:'hero',hp:30,maxHp:40,alive:true,...overrides});

test('phase 447 auto indicator explains core-defense boss elite and specialist priority without changing target selection',()=>{
  assert.match(autoTargetIndicator(target({target:'core'}),hero,core).label,/CORE/);
  assert.match(autoTargetIndicator(target({type:'boss'}),hero,core).label,/BOSS/);
  assert.match(autoTargetIndicator(target({type:'elite'}),hero,core).label,/ELITE/);
  assert.match(autoTargetIndicator(target({type:'bomber'}),hero,core).label,/THREAT/);
});

test('phase 448 auto indicator stays compact and fades when there is no valid auto target',()=>{
  assert.equal(autoTargetIndicator(null,hero,core),null);
  const cue=autoTargetIndicator(target(),hero,core);
  assert.ok(cue.label.length<=18);
  assert.ok(cue.radius>=24&&cue.radius<=96);
});

test('phase 449 boss weakpoints get a stronger readable cue while healthy nodes remain bounded',()=>{
  const cue=weakpointIndicator({id:2,kind:'armorPlate',pos:{x:300,y:200},hp:80,maxHp:200,radius:27,alive:true});
  assert.equal(cue.label,'약점');
  assert.ok(cue.urgency>0.5);
  assert.ok(cue.radius<=52);
});

test('phase 450 destroyed weakpoints disappear instead of leaving stale combat markers',()=>{
  assert.equal(weakpointIndicator({id:2,kind:'armorPlate',pos:{x:300,y:200},hp:0,maxHp:200,radius:27,alive:false}),null);
});
