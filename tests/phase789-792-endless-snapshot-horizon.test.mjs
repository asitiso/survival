import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeRunSnapshot, saveRunSnapshot, loadRunSnapshot } from '../dist/domain/run-snapshot.js';
import { appendRecoveryCheckpoint, loadRunSnapshotWithJournal } from '../dist/domain/recovery-journal.js';

function sample(hours, savedAt=hours*1000){return{
  version:1,savedAt,heroId:'arkan',traitId:'destruction',threatLevel:5,elapsed:hours*3600,
  hero:{level:50,xp:100,xpNext:200,hp:500,maxHp:500,coins:1000,kills:10000},coreHp:800,
  spellLevels:{fireBolt:10,chainLightning:10,frostNova:10,flameField:10,meteorStorm:10,blackHole:10},
  equipment:{coins:1000,weapon:null,armor:null,healingPotions:2},relic:null,fusions:[],fateChoices:[],
  map:{id:'ruinedGate',evolutionStage:2},progression:{bossesKilled:50,goldEarned:100000,shopTokens:2}
};}
function memory(){const m=new Map();return{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};}

test('phase 789 sanitizer preserves a 36-hour endless run',()=>{assert.equal(sanitizeRunSnapshot(sample(36))?.elapsed,36*3600);});
test('phase 790 primary snapshot round-trips a 72-hour endless run',()=>{const s=memory();saveRunSnapshot(s,sample(72));assert.equal(loadRunSnapshot(s)?.elapsed,72*3600);});
test('phase 791 recovery journal round-trips a 72-hour endless run',()=>{const s=memory();appendRecoveryCheckpoint(s,sample(72));assert.equal(loadRunSnapshotWithJournal(s)?.elapsed,72*3600);});
test('phase 792 corrupt absurd elapsed remains bounded',()=>{const out=sanitizeRunSnapshot({...sample(1),elapsed:1e15});assert.ok(out);assert.ok(out.elapsed<=7*24*3600);});
