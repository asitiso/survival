import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import { heroProjectileTravelHandoffPresentation } from '../dist/game/hero-projectile-travel-handoff-rendering.js';
const base={origin:{x:100,y:80},projectile:{x:220,y:80},ttl:.07,maxTtl:.13};
test('long travel handoff stays attached to projectile',()=>{const p=heroProjectileTravelHandoffPresentation(base,false);assert.equal(p.visible,true);assert.equal(p.end.x,220);});
test('long bridge slides its start forward under cap',()=>{const p=heroProjectileTravelHandoffPresentation(base,false);assert.ok(p.start.x>100);assert.ok(p.length<=76.001);});
test('short bridge preserves original muzzle',()=>{const p=heroProjectileTravelHandoffPresentation({...base,projectile:{x:140,y:80}},false);assert.equal(p.start.x,100);});
test('expired handoff disappears',()=>{assert.equal(heroProjectileTravelHandoffPresentation({...base,ttl:0},false).visible,false);});
test('reduced motion uses tighter cap',()=>{const f=heroProjectileTravelHandoffPresentation(base,false),r=heroProjectileTravelHandoffPresentation(base,true);assert.ok(r.length<=f.length);});
test('live hero travel uses handoff after continuity metadata',()=>{const s=fs.readFileSync('src/game/spells.ts','utf8');assert.match(s,/heroProjectileTravelHandoffPresentation/);assert.match(s,/travelHandoff\.visible/);});
