import test from 'node:test';
import assert from 'node:assert/strict';

import { saveRunSnapshot } from '../dist/domain/run-snapshot.js';
import { appendRecoveryCheckpoint, loadRecoveryJournal, loadRunSnapshotWithJournal, clearRecoveryJournal } from '../dist/domain/recovery-journal.js';

function memoryStorage({throwOnSet=false}={}) {
  const map=new Map();
  return {map,getItem:(k)=>map.get(k)??null,setItem:(k,v)=>{if(throwOnSet)throw new Error('quota');map.set(k,v)},removeItem:(k)=>map.delete(k)};
}
function snapshot(elapsed) {
  return {
    version:1,savedAt:elapsed*1000,heroId:'arkan',traitId:'destruction',threatLevel:5,elapsed,
    hero:{level:30,xp:10,xpNext:100,hp:500,maxHp:500,coins:100,kills:200},coreHp:900,
    spellLevels:{fireBolt:10,chainLightning:10,frostNova:10,flameField:10,meteorStorm:3,blackHole:3},
    equipment:{coins:100,weapon:null,armor:null,healingPotions:1},relic:null,fusions:[],fateChoices:[],
    map:{id:'ruinedGate',evolutionStage:2},progression:{bossesKilled:3,goldEarned:1000,shopTokens:1},
  };
}

test('phase 58 recovery journal keeps only the newest three valid checkpoints', () => {
  const storage=memoryStorage();
  for (const elapsed of [60,120,180,240]) appendRecoveryCheckpoint(storage,snapshot(elapsed));
  assert.deepEqual(loadRecoveryJournal(storage).map((x)=>x.elapsed),[240,180,120]);
});

test('phase 59 recovery priority remains primary then backup before journal', () => {
  const storage=memoryStorage();
  appendRecoveryCheckpoint(storage,snapshot(60));
  saveRunSnapshot(storage,snapshot(90));
  saveRunSnapshot(storage,snapshot(105));
  assert.equal(loadRunSnapshotWithJournal(storage)?.elapsed,105);
  storage.setItem('arcane-last-stand.run-snapshot','{bad');
  assert.equal(loadRunSnapshotWithJournal(storage)?.elapsed,90);
});

test('journal restores newest valid checkpoint when both normal slots are unusable', () => {
  const storage=memoryStorage();
  appendRecoveryCheckpoint(storage,snapshot(60));
  appendRecoveryCheckpoint(storage,snapshot(120));
  storage.setItem('arcane-last-stand.run-snapshot','{bad');
  storage.setItem('arcane-last-stand.run-snapshot.backup','{bad');
  assert.equal(loadRunSnapshotWithJournal(storage)?.elapsed,120);
});

test('corrupt journal entries are ignored and persistence quota errors never break the run', () => {
  const storage=memoryStorage();
  storage.setItem('arcane-last-stand.recovery-journal.v1',JSON.stringify([{bad:true},snapshot(180),'{oops']));
  assert.deepEqual(loadRecoveryJournal(storage).map((x)=>x.elapsed),[180]);
  assert.doesNotThrow(()=>appendRecoveryCheckpoint(memoryStorage({throwOnSet:true}),snapshot(60)));
});

test('clear recovery journal removes only the journal slot', () => {
  const storage=memoryStorage();
  appendRecoveryCheckpoint(storage,snapshot(60));
  storage.setItem('keep','yes');
  clearRecoveryJournal(storage);
  assert.equal(loadRecoveryJournal(storage).length,0);
  assert.equal(storage.getItem('keep'),'yes');
});

test('phase 60 snapshot preserves a full eight-hour checkpoint without truncating elapsed time', () => {
  const storage=memoryStorage();
  saveRunSnapshot(storage,snapshot(8*60*60));
  assert.equal(loadRunSnapshotWithJournal(storage)?.elapsed,8*60*60);
});
