import { saveRunSnapshot, loadRunSnapshot, type RunSnapshot, type SnapshotStorage } from '../domain/run-snapshot.js';
import { appendRecoveryCheckpoint, loadRunSnapshotWithJournal } from '../domain/recovery-journal.js';
import { createDefaultEndlessState } from './endless/runtime.js';
import { serializeExtension } from './endless/snapshot.js';
import type { HeroId } from './hero-profiles.js';

export interface LifecycleResumeIntegrityAudit{
  samples:number;
  primaryRoundTripCoverage:number;
  backupRecoveryCoverage:number;
  journalRecoveryCoverage:number;
  endlessRoundTripCoverage:number;
  maxElapsedDrift:number;
  snapshotSchemaMutation:false;
  passed:boolean;
}
function memoryStorage():SnapshotStorage&{map:Map<string,string>}{const map=new Map<string,string>();return{map,getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value),removeItem:key=>{map.delete(key);}};}
function snapshot(heroId:HeroId,elapsed:number,seed:number):RunSnapshot{return{
  version:1,savedAt:elapsed*1000,heroId,traitId:'destruction',threatLevel:5,elapsed,
  hero:{level:42,xp:420,xpNext:900,hp:760,maxHp:900,coins:2400,kills:1800},coreHp:820,
  spellLevels:{fireBolt:10,chainLightning:10,frostNova:10,flameField:10,meteorStorm:6,blackHole:6},
  equipment:{coins:2400,weapon:{id:'arcane-staff',kind:'weapon',name:'Arcane',rank:4,power:.15,legendary:false},armor:{id:'iron-robe',kind:'armor',name:'Robe',rank:4,power:.08,legendary:false},healingPotions:2},
  relic:'abyss-eye',fusions:['solar-detonation'],fateChoices:['frenzy'],map:{id:'ruinedGate',evolutionStage:2},progression:{bossesKilled:4,goldEarned:8200,shopTokens:2},
  endless:serializeExtension(createDefaultEndlessState(seed)),
};}
function round(value:number):number{return Math.round(value*1000)/1000;}
export function auditLifecycleResumeIntegrity():LifecycleResumeIntegrityAudit{
  const heroes:HeroId[]=['arkan','seria','kain','edric'];const checkpoints=[1200,1500,1800];
  let samples=0,primary=0,backup=0,journal=0,endless=0,maxElapsedDrift=0;
  for(const hero of heroes)for(const elapsed of checkpoints){
    samples++;
    const storage=memoryStorage();const current=snapshot(hero,elapsed,elapsed+hero.length);
    saveRunSnapshot(storage,current);const roundTrip=loadRunSnapshot(storage);
    if(roundTrip){primary++;maxElapsedDrift=Math.max(maxElapsedDrift,Math.abs(roundTrip.elapsed-elapsed));if(roundTrip.endless===current.endless)endless++;}
    const older=snapshot(hero,elapsed-15,elapsed+1);saveRunSnapshot(storage,older);saveRunSnapshot(storage,current);
    storage.setItem('arcane-last-stand.run-snapshot','{corrupt');
    if(loadRunSnapshot(storage)?.elapsed===older.elapsed)backup++;
    appendRecoveryCheckpoint(storage,current);
    storage.setItem('arcane-last-stand.run-snapshot','{corrupt');storage.setItem('arcane-last-stand.run-snapshot.backup','{corrupt');
    if(loadRunSnapshotWithJournal(storage)?.elapsed===current.elapsed)journal++;
  }
  const primaryRoundTripCoverage=round(primary/samples),backupRecoveryCoverage=round(backup/samples),journalRecoveryCoverage=round(journal/samples),endlessRoundTripCoverage=round(endless/samples);
  const passed=samples===12&&primaryRoundTripCoverage===1&&backupRecoveryCoverage===1&&journalRecoveryCoverage===1&&endlessRoundTripCoverage===1&&maxElapsedDrift===0;
  return{samples,primaryRoundTripCoverage,backupRecoveryCoverage,journalRecoveryCoverage,endlessRoundTripCoverage,maxElapsedDrift,snapshotSchemaMutation:false,passed};
}
