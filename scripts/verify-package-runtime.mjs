import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { evaluatePackageRuntimeSmoke } from '../dist/game/package-runtime-smoke.js';

function command(command,args,cwd=process.cwd()){return spawnSync(command,args,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe']});}
function revision(){const r=command('git',['rev-parse','HEAD']);return r.status===0?r.stdout.trim():'source';}
function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
async function status(url){try{const response=await fetch(url,{cache:'no-store'});return response.status;}catch{return 0;}}

const sourceRevision=revision();
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'arcane-package-smoke-'));
const zip=path.join(temp,'release.zip');const extracted=path.join(temp,'extracted');fs.mkdirSync(extracted);
let processExitErrors=0,httpFailures=0,okPathCount=0,archiveComment='';
const requiredPaths=['/','/dist/main.js','/dist/game/game.js','/dist/game/release-play-journey-audit.js','/dist/game/lifecycle-resume-integrity-audit.js','/dist/core/input-lifecycle.js','/dist/game/accessibility-release-audit.js','/dist/game/package-runtime-smoke.js','/src/styles.css'];
const archived=command('git',['archive','--format=zip',`--output=${zip}`,'HEAD']);
if(archived.status!==0)processExitErrors++;
if(processExitErrors===0){
  const comment=command('unzip',['-z',zip]);archiveComment=comment.status===0?comment.stdout.trim().split('\n').at(-1)?.trim()??'':'';
  const unpack=command('unzip',['-q',zip,'-d',extracted]);if(unpack.status!==0)processExitErrors++;
}
let server=null;
try{
  if(processExitErrors===0){
    const port=43200+(process.pid%500);
    server=spawn(process.execPath,['scripts/serve.mjs'],{cwd:extracted,env:{...process.env,PORT:String(port)},stdio:['ignore','ignore','ignore']});
    let ready=false;
    for(let i=0;i<40;i++){if(server.exitCode!==null){processExitErrors++;break;}if(await status(`http://127.0.0.1:${port}/`)===200){ready=true;break;}await sleep(50);}
    if(!ready&&server?.exitCode===null)httpFailures++;
    if(ready){for(const item of requiredPaths){const code=await status(`http://127.0.0.1:${port}${item}`);if(code===200)okPathCount++;else httpFailures++;}}
  }
}finally{
  if(server&&server.exitCode===null)server.kill('SIGTERM');
  await sleep(30);
  fs.rmSync(temp,{recursive:true,force:true});
}
const audit=evaluatePackageRuntimeSmoke({sourceRevision,archiveComment,requiredPathCount:requiredPaths.length,okPathCount,httpFailures,processExitErrors});
console.log(`PACKAGE_RUNTIME_EVIDENCE ${JSON.stringify(audit)}`);
if(!audit.passed)process.exitCode=2;
