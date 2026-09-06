import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import { bossSpecialOriginAnchorPresentation } from '../dist/game/boss-special-origin-anchor-rendering.js';
const base={bodyOffsetX:7,bodyOffsetY:-3,rebaseOffsetX:-20,rebaseOffsetY:6,handoffStrength:.8,charge:.85,recovery:.05,stagger:0};
test('active displaced special prefers shared ground anchor',()=>{const p=bossSpecialOriginAnchorPresentation(base,false);assert.equal(p.owner,'ground');assert.ok(p.anchorOffsetX<0);});
test('calm boss keeps anchor near body',()=>{const p=bossSpecialOriginAnchorPresentation({...base,rebaseOffsetX:0,rebaseOffsetY:0,handoffStrength:0,charge:.05},false);assert.equal(p.owner,'body');assert.ok(Math.abs(p.anchorOffsetX)<=8);});
test('recovery moves shared anchor back toward body',()=>{const a=bossSpecialOriginAnchorPresentation(base,false),r=bossSpecialOriginAnchorPresentation({...base,recovery:.9,charge:.1},false);assert.ok(Math.abs(r.anchorOffsetX)<Math.abs(a.anchorOffsetX));});
test('stagger forces body ownership',()=>{const p=bossSpecialOriginAnchorPresentation({...base,stagger:.9},false);assert.equal(p.owner,'body');});
test('reduced motion tightens shared anchor',()=>{const f=bossSpecialOriginAnchorPresentation(base,false),r=bossSpecialOriginAnchorPresentation(base,true);assert.ok(Math.hypot(r.anchorOffsetX,r.anchorOffsetY)<=Math.hypot(f.anchorOffsetX,f.anchorOffsetY));});
test('warning ring and boss launch origin both consume shared anchor',()=>{const e=fs.readFileSync('src/game/enemies.ts','utf8'),b=fs.readFileSync('src/game/boss-special-launch-origin-rendering.ts','utf8');assert.match(e,/bossSpecialOriginAnchorPresentation/);assert.match(b,/bossSpecialOriginAnchorPresentation/);});
