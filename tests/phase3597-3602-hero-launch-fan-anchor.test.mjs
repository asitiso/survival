import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import { heroLaunchFanAnchorPresentation } from '../dist/game/hero-launch-fan-anchor-rendering.js';
const base={baseOffsetX:26,baseOffsetY:-3,facingX:1,facingY:0,radius:22,count:5,kind:'normal'};
test('single projectile keeps exact shared anchor',()=>{const p=heroLaunchFanAnchorPresentation({...base,count:1,index:0},false);assert.equal(p.offsetX,26);assert.equal(p.offsetY,-3);});
test('fan center projectile stays on shared anchor',()=>{const p=heroLaunchFanAnchorPresentation({...base,index:2},false);assert.ok(Math.abs(p.offsetY+3)<.001);});
test('fan edge offsets are symmetric',()=>{const a=heroLaunchFanAnchorPresentation({...base,index:0},false),b=heroLaunchFanAnchorPresentation({...base,index:4},false);assert.ok(Math.abs((a.offsetY+3)+(b.offsetY+3))<.001);});
test('normal fan visual spread remains tightly bounded',()=>{for(let i=0;i<5;i++){const p=heroLaunchFanAnchorPresentation({...base,index:i},false);assert.ok(Math.abs(p.lateralOffset)<=4.001);}});
test('reduced motion tightens fan spread',()=>{const f=heroLaunchFanAnchorPresentation({...base,index:0},false),r=heroLaunchFanAnchorPresentation({...base,index:0},true);assert.ok(Math.abs(r.lateralOffset)<Math.abs(f.lateralOffset));});
test('live fire bolt uses fan anchor per projectile',()=>{const src=fs.readFileSync('src/game/spells.ts','utf8');assert.match(src,/heroLaunchFanAnchorPresentation/);assert.match(src,/fanAnchor\.offsetX/);});
