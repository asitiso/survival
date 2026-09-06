import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import { bossSharedAnchorTravelContinuityPresentation } from '../dist/game/boss-shared-anchor-travel-continuity-rendering.js';
const base={anchor:{x:300,y:200},projectile:{x:340,y:205},velocity:{x:420,y:40},ttl:.11,maxTtl:.15,radius:18};
test('boss projectile keeps shared-anchor bridge during initial travel',()=>{const p=bossSharedAnchorTravelContinuityPresentation(base,false);assert.equal(p.visible,true);});
test('bridge begins at shared special anchor',()=>{const p=bossSharedAnchorTravelContinuityPresentation(base,false);assert.deepEqual(p.start,base.anchor);});
test('boss bridge length is strictly capped',()=>{const p=bossSharedAnchorTravelContinuityPresentation({...base,projectile:{x:600,y:200}},false);assert.ok(p.length<=92.001);});
test('expired travel releases shared anchor',()=>{const p=bossSharedAnchorTravelContinuityPresentation({...base,ttl:0},false);assert.equal(p.visible,false);});
test('reduced motion tightens boss anchor history',()=>{const f=bossSharedAnchorTravelContinuityPresentation(base,false),r=bossSharedAnchorTravelContinuityPresentation(base,true);assert.ok(r.length<=f.length);});
test('live boss projectile stores shared anchor travel metadata',()=>{const s=fs.readFileSync('src/game/enemies.ts','utf8');assert.match(s,/visualLaunchWorldOrigin/);assert.match(s,/bossSharedAnchorTravelContinuityPresentation/);});
