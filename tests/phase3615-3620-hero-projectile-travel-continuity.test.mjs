import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import { heroProjectileTravelContinuityPresentation } from '../dist/game/hero-projectile-travel-continuity-rendering.js';
const base={origin:{x:100,y:80},projectile:{x:145,y:82},velocity:{x:700,y:0},ttl:.10,maxTtl:.13,radius:12};
test('early projectile travel keeps a visible muzzle bridge',()=>{const p=heroProjectileTravelContinuityPresentation(base,false);assert.equal(p.visible,true);assert.ok(p.alpha>0);});
test('bridge starts at immutable launch origin',()=>{const p=heroProjectileTravelContinuityPresentation(base,false);assert.deepEqual(p.start,base.origin);});
test('bridge ends no farther than projectile head',()=>{const p=heroProjectileTravelContinuityPresentation(base,false);assert.ok(p.end.x<=base.projectile.x+.001);});
test('long separation is capped',()=>{const p=heroProjectileTravelContinuityPresentation({...base,projectile:{x:400,y:80}},false);assert.ok(p.length<=76.001);});
test('reduced motion shortens bridge',()=>{const f=heroProjectileTravelContinuityPresentation(base,false),r=heroProjectileTravelContinuityPresentation(base,true);assert.ok(r.length<=f.length);assert.ok(r.alpha<=f.alpha);});
test('live hero projectiles preserve launch world origin and render bridge',()=>{const s=fs.readFileSync('src/game/spells.ts','utf8');assert.match(s,/visualLaunchWorldOrigin/);assert.match(s,/heroProjectileTravelContinuityPresentation/);});
