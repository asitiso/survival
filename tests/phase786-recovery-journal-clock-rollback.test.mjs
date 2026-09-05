import test from 'node:test';
import assert from 'node:assert/strict';

import { appendRecoveryCheckpoint, loadRecoveryJournal, loadRunSnapshotWithJournal } from '../dist/domain/recovery-journal.js';

function storage(){
  const map=new Map();
  return {map,getItem:(key)=>map.get(key)??null,setItem:(key,value)=>map.set(key,value),removeItem:(key)=>map.delete(key)};
}
function snapshot({savedAt,elapsed}){
  return {
    version:1,savedAt,heroId:'arkan',traitId:'destruction',threatLevel:5,elapsed,
    hero:{level:30,xp:10,xpNext:100,hp:500,maxHp:500,coins:100,kills:200},coreHp:900,
    spellLevels:{fireBolt:10,chainLightning:10,frostNova:10,flameField:10,meteorStorm:3,blackHole:3},
    equipment:{coins:100,weapon:null,armor:null,healingPotions:1},relic:null,fusions:[],fateChoices:[],
    map:{id:'ruinedGate',evolutionStage:2},progression:{bossesKilled:3,goldEarned:1000,shopTokens:1},
  };
}

test('phase 786 journal recency follows append order when wall clock moves backward',()=>{
  const s=storage();
  appendRecoveryCheckpoint(s,snapshot({savedAt:5000,elapsed:100}));
  appendRecoveryCheckpoint(s,snapshot({savedAt:4000,elapsed:160}));
  assert.deepEqual(loadRecoveryJournal(s).map((entry)=>entry.elapsed),[160,100]);
});

test('phase 787 journal fallback restores the newest appended checkpoint after clock rollback',()=>{
  const s=storage();
  appendRecoveryCheckpoint(s,snapshot({savedAt:5000,elapsed:100}));
  appendRecoveryCheckpoint(s,snapshot({savedAt:4000,elapsed:160}));
  s.setItem('arcane-last-stand.run-snapshot','{bad');
  s.setItem('arcane-last-stand.run-snapshot.backup','{bad');
  assert.equal(loadRunSnapshotWithJournal(s)?.elapsed,160);
});

test('phase 788 journal keeps the latest three appends even across repeated clock rollback',()=>{
  const s=storage();
  for(const [savedAt,elapsed] of [[9000,60],[8000,120],[7000,180],[6000,240]]) appendRecoveryCheckpoint(s,snapshot({savedAt,elapsed}));
  assert.deepEqual(loadRecoveryJournal(s).map((entry)=>entry.elapsed),[240,180,120]);
});
