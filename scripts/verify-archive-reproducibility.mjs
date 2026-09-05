import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
const run=(cmd,args)=>spawnSync(cmd,args,{cwd:process.cwd(),encoding:'utf8',stdio:['ignore','pipe','pipe']});
const text=(cmd,args)=>{const r=run(cmd,args);return r.status===0?r.stdout.trim():'';};
const sourceRevision=text('git',['rev-parse','HEAD']);
const tracked=text('git',['ls-files']).split('\n').filter(Boolean);
const dirty=text('git',['status','--porcelain','--untracked-files=no']);
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'als-archive-'));
let archiveErrors=dirty?1:0;
const files=[];
for(const name of ['first.zip','second.zip']){const target=path.join(dir,name);const r=run('git',['archive','--format=zip',`--output=${target}`,'HEAD']);if(r.status!==0)archiveErrors++;files.push(target);}
function sha(file){return fs.existsSync(file)?crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'):'';}
function entries(file){const r=run('unzip',['-Z1',file]);if(r.status!==0){archiveErrors++;return [];}return r.stdout.split('\n').filter(Boolean);}
function comment(file){const r=run('unzip',['-z',file]);if(r.status!==0){archiveErrors++;return '';}return r.stdout.split('\n').map((x)=>x.trim()).find((x)=>/^[0-9a-f]{40}$/i.test(x))??'';}
const e1=entries(files[0]),e2=entries(files[1]),fileEntries=e1.filter((x)=>!x.endsWith('/'));
const set=new Set(fileEntries),trackedSet=new Set(tracked);const missingTrackedFiles=tracked.filter((x)=>!set.has(x)).length,unexpectedFiles=fileEntries.filter((x)=>!trackedSet.has(x)).length;
const raw={sourceRevision,firstSha256:sha(files[0]),secondSha256:sha(files[1]),firstEntryCount:e1.length,secondEntryCount:e2.length,trackedFileCount:tracked.length,firstComment:comment(files[0]),secondComment:comment(files[1]),missingTrackedFiles,unexpectedFiles,archiveErrors};
const { evaluateArchiveReproducibility }=await import('../dist/game/archive-reproducibility.js');const audit=evaluateArchiveReproducibility(raw);
console.log(`# Archive Reproducibility | ${audit.passed?'PASS':'REVIEW'} · entries ${audit.firstEntryCount}/${audit.secondEntryCount} · tracked ${audit.trackedFileCount} · hash ${audit.hashMatch?'match':'drift'}`);
console.log(`ARCHIVE_EVIDENCE ${JSON.stringify(audit)}`);
if(audit.issues.length)console.error(audit.issues.join(','));
fs.rmSync(dir,{recursive:true,force:true});process.exitCode=audit.passed?0:2;
