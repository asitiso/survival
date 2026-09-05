import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeRunSnapshot, saveRunSnapshot, loadRunSnapshot } from '../dist/domain/run-snapshot.js';
import { appendRecoveryCheckpoint, loadRecoveryJournal } from '../dist/domain/recovery-journal.js';
function sample(savedAt=100){return{version:1,savedAt,heroId:'arkan',traitId:'destruction',threatLevel:3,elapsed:60,hero:{level:10,xp:10,xpNext:20,hp:100,maxHp:100,coins:20,kills:30},coreHp:100,spellLevels:{fireBolt:1,chainLightning:1,frostNova:1,flameField:1,meteorStorm:1,blackHole:1},equipment:{coins:20,weapon:null,armor:null,healingPotions:1},relic:null,fusions:[],fateChoices:[],map:{id:'ruinedGate',evolutionStage:0},progression:{bossesKilled:1,goldEarned:20,shopTokens:0}};}
function memory(){const m=new Map();return{m,getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};}

test('phase 793 sanitizer rejects a future snapshot schema version',()=>{assert.equal(sanitizeRunSnapshot({...sample(),version:2}),null);});
test('phase 794 sanitizer rejects a snapshot with no schema version',()=>{const s=sample();delete s.version;assert.equal(sanitizeRunSnapshot(s),null);});
test('phase 795 unsupported snapshot cannot overwrite a valid primary checkpoint',()=>{const s=memory();saveRunSnapshot(s,sample(100));saveRunSnapshot(s,{...sample(200),version:2});assert.equal(loadRunSnapshot(s)?.savedAt,100);});
test('phase 796 recovery journal ignores unsupported snapshot versions',()=>{const s=memory();appendRecoveryCheckpoint(s,{...sample(200),version:2});assert.deepEqual(loadRecoveryJournal(s),[]);});
