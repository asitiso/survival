import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import { bossAnchorTravelReleasePresentation } from '../dist/game/boss-anchor-travel-release-rendering.js';
const base={anchor:{x:300,y:200},projectile:{x:410,y:205},ttl:.06,maxTtl:.15};
test('active release segment remains attached to projectile',()=>{const p=bossAnchorTravelReleasePresentation(base,false);assert.equal(p.visible,true);assert.deepEqual(p.end,base.projectile);});
test('old anchor history slides forward under cap',()=>{const p=bossAnchorTravelReleasePresentation(base,false);assert.ok(p.start.x>300);assert.ok(p.length<=92.001);});
test('early nearby travel retains shared anchor',()=>{const p=bossAnchorTravelReleasePresentation({...base,projectile:{x:340,y:202},ttl:.13},false);assert.equal(p.start.x,300);});
test('expired boss history disappears',()=>{assert.equal(bossAnchorTravelReleasePresentation({...base,ttl:0},false).visible,false);});
test('reduced motion releases history faster',()=>{const f=bossAnchorTravelReleasePresentation(base,false),r=bossAnchorTravelReleasePresentation(base,true);assert.ok(r.length<=f.length);assert.ok(r.alpha<=f.alpha);});
test('live boss travel uses release presentation',()=>{const s=fs.readFileSync('src/game/enemies.ts','utf8');assert.match(s,/bossAnchorTravelReleasePresentation/);assert.match(s,/bossTravelRelease\.visible/);});
