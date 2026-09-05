import fs from 'node:fs';
import path from 'node:path';
import { rasterReleaseQualityGate } from '../dist/game/render-raster-release-gate.js';

const gate=rasterReleaseQualityGate();
console.log(gate.markdown);
const outIndex=process.argv.indexOf('--out');
const out=outIndex>=0?process.argv[outIndex+1]:null;
if(out){const target=path.resolve(out);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,`${gate.markdown}\n`,'utf8');}
process.exitCode=gate.exitCode;
