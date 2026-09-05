import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { evaluatePackageRunCycleSmoke } from '../dist/game/package-run-cycle-smoke.js';
function command(command,args,cwd=process.cwd()){return spawnSync(command,args,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe']});}
function revision(){const r=command('git',['rev-parse','HEAD']);return r.status===0?r.stdout.trim():'source';}
const sourceRevision=revision(),temp=fs.mkdtempSync(path.join(os.tmpdir(),'arcane-run-cycle-')),zip=path.join(temp,'release.zip'),extracted=path.join(temp,'extracted');fs.mkdirSync(extracted);
let archiveComment='',newRunOk=false,checkpointOk=false,resumeOk=false,elapsedDrift=Number.POSITIVE_INFINITY,endlessStateMatch=false,processExitErrors=0;
try{
  const archived=command('git',['archive','--format=zip',`--output=${zip}`,'HEAD']);if(archived.status!==0)processExitErrors++;
  if(processExitErrors===0){const comment=command('unzip',['-z',zip]);archiveComment=comment.status===0?comment.stdout.trim().split('\n').at(-1)?.trim()??'':'';const unpack=command('unzip',['-q',zip,'-d',extracted]);if(unpack.status!==0)processExitErrors++;}
  if(processExitErrors===0){
    const runSnapshot=await import(pathToFileURL(path.join(extracted,'dist/domain/run-snapshot.js')).href);
    const runtime=await import(pathToFileURL(path.join(extracted,'dist/game/endless/runtime.js')).href);
    const snapshotCodec=await import(pathToFileURL(path.join(extracted,'dist/game/endless/snapshot.js')).href);
    const state=runtime.createDefaultEndlessState(742);newRunOk=state.rng.seed===742;
    const savedAt=742000,elapsed=742;const snapshot={version:1,savedAt,heroId:'arkan',traitId:'destruction',threatLevel:5,elapsed,hero:{level:18,xp:250,xpNext:600,hp:700,maxHp:800,coins:900,kills:520},coreHp:850,spellLevels:{fireBolt:6,chainLightning:5,frostNova:4,flameField:5,meteorStorm:2,blackHole:2},equipment:{coins:900,weapon:null,armor:null,healingPotions:2},relic:null,fusions:[],fateChoices:[],map:{id:'ruinedGate',evolutionStage:1},progression:{bossesKilled:2,goldEarned:1900,shopTokens:1},endless:snapshotCodec.serializeExtension(state)};
    const map=new Map();const storage={getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value),removeItem:key=>{map.delete(key);}};
    runSnapshot.saveRunSnapshot(storage,snapshot);const checkpoint=runSnapshot.loadRunSnapshot(storage);checkpointOk=checkpoint?.savedAt===savedAt&&checkpoint?.elapsed===elapsed;
    if(checkpoint){const restored=snapshotCodec.restoreExtension(checkpoint.endless??'',1);elapsedDrift=Math.abs(checkpoint.elapsed-elapsed);endlessStateMatch=restored.rng.seed===state.rng.seed;resumeOk=checkpoint.heroId==='arkan'&&checkpoint.progression.bossesKilled===2&&elapsedDrift===0&&endlessStateMatch;}
  }
}catch{processExitErrors++;}
finally{fs.rmSync(temp,{recursive:true,force:true});}
const audit=evaluatePackageRunCycleSmoke({sourceRevision,archiveComment,newRunOk,checkpointOk,resumeOk,elapsedDrift:Number.isFinite(elapsedDrift)?elapsedDrift:999,endlessStateMatch,processExitErrors});
console.log(`PACKAGE_RUN_CYCLE_EVIDENCE ${JSON.stringify(audit)}`);if(!audit.passed)process.exitCode=2;
