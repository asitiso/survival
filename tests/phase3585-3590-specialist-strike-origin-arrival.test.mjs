import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import { specialistStrikeOriginArrivalPresentation } from '../dist/game/specialist-strike-origin-arrival-rendering.js';
const input={body:{x:100,y:100},origin:{x:128,y:100},target:{x:145,y:100},ttl:.18,maxTtl:.18};
test('new strike cue begins at silhouette-coherent origin',()=>{const p=specialistStrikeOriginArrivalPresentation(input,false);assert.ok(Math.abs(p.marker.x-128)<.001);});
test('cue converges toward actual contact as lifetime decays',()=>{const p=specialistStrikeOriginArrivalPresentation({...input,ttl:.05},false);assert.ok(p.marker.x>128&&p.marker.x<145);});
test('expired cue reaches contact anchor',()=>{const p=specialistStrikeOriginArrivalPresentation({...input,ttl:0},false);assert.ok(Math.abs(p.marker.x-145)<.001);});
test('arrival never overshoots target',()=>{const p=specialistStrikeOriginArrivalPresentation({...input,ttl:-1},false);assert.ok(p.marker.x<=145.001);});
test('reduced motion shortens visual travel while keeping endpoint',()=>{const f=specialistStrikeOriginArrivalPresentation({...input,ttl:.09},false),r=specialistStrikeOriginArrivalPresentation({...input,ttl:.09},true);assert.ok(Math.abs(r.marker.x-128)<=Math.abs(f.marker.x-128));});
test('live specialist cue stores target contact position',()=>{const src=fs.readFileSync('src/game/enemies.ts','utf8');assert.match(src,/specialistStrikeOriginArrivalPresentation/);assert.match(src,/specialistStrikeOriginVfx[^\n]*target/);});
