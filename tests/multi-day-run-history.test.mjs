import test from 'node:test';
import assert from 'node:assert/strict';
import { appendRunHistory, loadRunHistory } from '../dist/domain/run-history.js';

function storage(){
  const data=new Map();
  return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};
}
function entry(seconds,runCode='ARC-MULTIDAY'){
  return {runCode,heroId:'arkan',seconds,threat:5,score:123456,mapId:'ruinedGate',bosses:99,archetype:'burst',finalForm:'solar-sovereign'};
}

test('phase 797 run history preserves a 36-hour endless result',()=>{
  const s=storage();
  assert.equal(appendRunHistory(s,entry(36*3600))[0].seconds,36*3600);
});

test('phase 798 run history preserves a 72-hour endless result',()=>{
  const s=storage();
  appendRunHistory(s,entry(72*3600));
  assert.equal(loadRunHistory(s)[0].seconds,72*3600);
});

test('phase 799 persisted 72-hour history round-trips without elapsed drift',()=>{
  const s=storage();
  appendRunHistory(s,entry(72*3600,'ARC-72H'));
  const first=loadRunHistory(s)[0];
  const second=loadRunHistory(s)[0];
  assert.equal(first.seconds,second.seconds);
  assert.equal(second.seconds,72*3600);
});

test('phase 800 corrupt overlong history remains bounded to the seven-day run limit',()=>{
  const s=storage();
  assert.equal(appendRunHistory(s,entry(8*24*3600))[0].seconds,7*24*3600);
});
