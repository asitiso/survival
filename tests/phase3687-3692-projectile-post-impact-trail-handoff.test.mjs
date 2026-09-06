import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as retirement from '../dist/game/projectile-multihit-impact-retirement-rendering.js';
const fn=retirement.projectilePostImpactTrailHandoffPresentation;
test('post-impact trail handoff helper exists',()=>{assert.equal(typeof fn,'function');});
test('continuing projectile starts with softened canonical sprite',()=>{const p=fn?.({ttl:.07,maxTtl:.08,continues:true},false);assert.ok(p);assert.equal(p.visible,true);assert.ok(p.spriteAlphaScale<1);});
test('handoff converges monotonically to canonical ownership',()=>{const a=fn?.({ttl:.07,maxTtl:.08,continues:true},false),b=fn?.({ttl:.02,maxTtl:.08,continues:true},false);assert.ok(a&&b);assert.ok(b.spriteAlphaScale>a.spriteAlphaScale);});
test('terminal projectile does not create post-impact travel handoff',()=>{const p=fn?.({ttl:.07,maxTtl:.08,continues:false},false);assert.ok(p);assert.equal(p.visible,false);});
test('reduced motion completes handoff faster',()=>{const a=fn?.({ttl:.05,maxTtl:.08,continues:true},false),b=fn?.({ttl:.05,maxTtl:.08,continues:true},true);assert.ok(a&&b);assert.ok(b.spriteAlphaScale>=a.spriteAlphaScale);});
test('live spell projectile stores advances and renders post-impact handoff metadata',()=>{const s=fs.readFileSync('src/game/spells.ts','utf8');assert.match(s,/visualImpactHandoffTtl/);assert.match(s,/projectilePostImpactTrailHandoffPresentation/);assert.match(s,/postImpactSpriteScale=.*postImpactHandoff.*spriteAlphaScale/s);});
