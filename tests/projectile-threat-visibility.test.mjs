import test from 'node:test';
import assert from 'node:assert/strict';
import { dangerProjectileCues } from '../dist/game/projectile-threat-visibility.js';
const hero={x:400,y:400},core={x:800,y:400};
function p(x,y,vx,vy,damage=10,target='hero'){return{pos:{x,y},vel:{x:vx,y:vy},radius:7,damage,target};}
test('phase 487 inbound hero projectiles are surfaced before harmless crossing or departing shots',()=>{
  const cues=dangerProjectileCues([p(200,400,260,0),p(350,250,260,0),p(500,400,260,0)],hero,core);
  assert.equal(cues.length,1);assert.equal(cues[0].index,0);assert.ok(cues[0].timeToImpact<1);
});
test('phase 488 imminent high-damage core projectiles become critical cues',()=>{
  const cues=dangerProjectileCues([p(650,400,300,0,28,'core')],hero,core);
  assert.equal(cues[0]?.level,'critical');assert.equal(cues[0]?.target,'core');
});
test('phase 489 projectile danger cues are score-sorted and capped to six',()=>{
  const shots=Array.from({length:12},(_,i)=>p(180-i*8,400,300,0,8+i,'hero'));
  const cues=dangerProjectileCues(shots,hero,core,6);
  assert.equal(cues.length,6);for(let i=1;i<cues.length;i++)assert.ok(cues[i-1].score>=cues[i].score);
});
test('phase 490 slow distant projectiles outside the early-warning horizon stay visually quiet',()=>{
  assert.deepEqual(dangerProjectileCues([p(0,400,40,0,8,'hero')],hero,core),[]);
});
