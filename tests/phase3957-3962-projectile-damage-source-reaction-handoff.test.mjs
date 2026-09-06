import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as retirement from '../dist/game/projectile-multihit-impact-retirement-rendering.js';
const fn=retirement.projectileDamageSourceEnemyReactionHandoffPresentation;
test('damage-source enemy reaction handoff helper exists',()=>assert.equal(typeof fn,'function'));
test('hit handoff keeps reaction while restoring canonical impact',()=>{const p=fn?.({owner:'hit-handoff',reactionOwner:'hit',ttl:.07,maxTtl:.18},false);assert.ok(p);assert.equal(p.owner,'handoff');assert.ok(p.reactionAlphaScale>0);assert.ok(p.impactSpriteAlphaScale>0);});
test('death owner yields impact decoration to death pose',()=>{const p=fn?.({owner:'death',reactionOwner:'death',ttl:.08,maxTtl:.18},false);assert.ok(p);assert.equal(p.owner,'death');assert.ok(p.impactSpriteAlphaScale<.6);assert.equal(p.deathPoseAlphaScale,1);});
test('late hit handoff returns canonical impact ownership',()=>{const p=fn?.({owner:'hit-handoff',reactionOwner:'hit',ttl:.015,maxTtl:.18},false);assert.ok(p);assert.equal(p.owner,'canonical');assert.equal(p.impactSpriteAlphaScale,1);});
test('reduced motion does not increase overlap',()=>{const a=fn?.({owner:'hit-handoff',reactionOwner:'hit',ttl:.07,maxTtl:.18},false),b=fn?.({owner:'hit-handoff',reactionOwner:'hit',ttl:.07,maxTtl:.18},true);assert.ok(a&&b);assert.ok(b.reactionAlphaScale<=a.reactionAlphaScale);});
test('live projectile renderer composes enemy reaction handoff',()=>{const s=fs.readFileSync('src/game/spells.ts','utf8');assert.match(s,/projectileDamageSourceEnemyReactionHandoffPresentation/);assert.match(s,/impactDamageSourceReactionHandoff/);});
