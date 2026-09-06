import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as retirement from '../dist/game/projectile-multihit-impact-retirement-rendering.js';
const fn=retirement.projectileImpactLineageDirectionPresentation;
test('impact lineage direction helper exists',()=>assert.equal(typeof fn,'function'));
test('impact direction is normalized from actual incoming vector',()=>{const p=fn?.({directionX:3,directionY:4,ttl:.12,maxTtl:.18},false);assert.ok(p);assert.ok(Math.abs(Math.hypot(p.facingX,p.facingY)-1)<1e-6);assert.ok(Math.abs(p.facingX-.6)<1e-6);assert.ok(Math.abs(p.facingY-.8)<1e-6);});
test('chain lineage keeps a readable directional cue',()=>{const p=fn?.({directionX:1,directionY:0,secondaryKind:'chain',ttl:.1,maxTtl:.14},false);assert.ok(p);assert.equal(p.visible,true);assert.ok(p.cueLength>=14);});
test('splash branch direction stays shorter than chain direction',()=>{const c=fn?.({directionX:1,directionY:0,secondaryKind:'chain',ttl:.1,maxTtl:.14},false),s=fn?.({directionX:1,directionY:0,secondaryKind:'splash',ttl:.1,maxTtl:.14},false);assert.ok(c&&s);assert.ok(s.cueLength<c.cueLength);});
test('reduced motion tightens directional cue without changing facing',()=>{const a=fn?.({directionX:-2,directionY:1,ttl:.1,maxTtl:.18},false),b=fn?.({directionX:-2,directionY:1,ttl:.1,maxTtl:.18},true);assert.ok(a&&b);assert.equal(a.facingX,b.facingX);assert.equal(a.facingY,b.facingY);assert.ok(b.cueLength<=a.cueLength);});
test('live impact visuals store actual direction and render lineage direction',()=>{const s=fs.readFileSync('src/game/spells.ts','utf8');assert.match(s,/impactDirection/);assert.match(s,/projectileImpactLineageDirectionPresentation/);});
