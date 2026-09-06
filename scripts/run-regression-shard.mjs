import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const shard=Number(process.argv[2]);
if(!Number.isInteger(shard)||shard<0||shard>7) throw new Error(`invalid shard ${process.argv[2]}`);
const all=readdirSync('tests').filter((name)=>name.endsWith('.test.mjs')).sort().map((name)=>`tests/${name}`);
const selected=all.filter((_,index)=>index%8===shard);
console.log(`TOTAL_TEST_FILES=${all.length}`);
console.log(`SHARD=${shard} FILES=${selected.length}`);
if(selected.length===0) throw new Error('empty shard');
const result=spawnSync(process.execPath,['--test',...selected],{stdio:'inherit'});
process.exit(result.status??1);
