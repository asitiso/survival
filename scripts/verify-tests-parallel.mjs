import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const EXCLUSIVE=/release-manifest|render-raster|archive|package-runtime|package-run-cycle|release-candidate-audit/i;
export function discoverTestFiles(root=new URL('../tests/',import.meta.url)){
  const dir=fileURLToPath(root);
  return fs.readdirSync(dir).filter(name=>name.endsWith('.test.mjs')).sort().map(name=>path.join(dir,name));
}
export function createTestExecutionPlan(files,requested=Math.max(1,os.cpus().length-1)){
  const workerCount=Math.max(1,Math.min(8,Math.floor(Number.isFinite(requested)?requested:1),Math.max(1,files.length)));
  const exclusive=[],parallel=[];
  for(const file of files)(EXCLUSIVE.test(path.basename(file))?exclusive:parallel).push(file);
  return{workerCount,parallel,exclusive};
}
function runFile(file){return new Promise(resolve=>{
  const child=spawn(process.execPath,['--test',file],{cwd:process.cwd(),stdio:['ignore','pipe','pipe']});
  let stdout='',stderr='';child.stdout.on('data',d=>stdout+=d);child.stderr.on('data',d=>stderr+=d);
  child.on('close',(code,signal)=>resolve({file,code:code??2,signal,stdout,stderr}));
});}
function count(stdout){const m=[...String(stdout).matchAll(/^# tests (\d+)$/gm)];return m.length?Number(m.at(-1)[1]):0;}
async function runPool(files,workers){let next=0;const results=[];async function worker(){while(true){const i=next++;if(i>=files.length)return;results[i]=await runFile(files[i]);}}await Promise.all(Array.from({length:Math.min(workers,Math.max(1,files.length))},worker));return results;}
export async function runAllTests(files=discoverTestFiles(),requested){
  const plan=createTestExecutionPlan(files,requested);const results=[];
  results.push(...await runPool(plan.parallel,plan.workerCount));
  for(const file of plan.exclusive)results.push(await runFile(file));
  const failures=results.filter(x=>x.code!==0),tests=results.reduce((n,x)=>n+count(x.stdout),0);
  return{plan,results,tests,failures};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const requested=Number(process.env.ALS_TEST_WORKERS||0)||undefined;const result=await runAllTests(undefined,requested);
  for(const failed of result.failures){process.stderr.write(`\n[FAIL] ${path.basename(failed.file)}\n${failed.stdout}${failed.stderr}\n`);}
  console.log(`1..${result.tests}`);console.log(`# tests ${result.tests}`);console.log(`# pass ${result.tests}`);console.log(`# fail ${result.failures.length}`);console.log(`# files ${result.results.length}`);console.log(`# workers ${result.plan.workerCount}`);
  process.exitCode=result.failures.length?2:0;
}
