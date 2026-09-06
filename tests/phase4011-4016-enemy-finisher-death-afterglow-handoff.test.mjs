import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as death from '../dist/game/enemy-hit-death-transition-rendering.js';
const fn=death.enemyFinisherDeathAfterglowHandoffPresentation;
test('death afterglow handoff helper exists',()=>assert.equal(typeof fn,'function'));
test('reaction owner preserves body before afterglow takeover',()=>{const p=fn?.({owner:'reaction',deathProgress:.2,afterglowAlpha:.2},false);assert.ok(p);assert.equal(p.owner,'reaction');assert.ok(p.bodyScale>.7);});
test('handoff owner crossfades body and afterglow within budget',()=>{const p=fn?.({owner:'afterglow',deathProgress:.56,afterglowAlpha:.8},false);assert.ok(p);assert.equal(p.owner,'handoff');assert.ok(p.bodyScale>0&&p.afterglowScale>0);assert.ok(p.bodyScale+p.afterglowScale<=1.35);});
test('late handoff settles to afterglow owner',()=>{const p=fn?.({owner:'afterglow',deathProgress:.9,afterglowAlpha:.6},false);assert.ok(p);assert.equal(p.owner,'afterglow');assert.ok(p.bodyScale<.2);});
test('reduced motion shortens overlap',()=>{const a=fn?.({owner:'afterglow',deathProgress:.55,afterglowAlpha:.8},false),b=fn?.({owner:'afterglow',deathProgress:.55,afterglowAlpha:.8},true);assert.ok(a&&b);assert.ok(b.bodyScale<=a.bodyScale);});
test('live death render composes handoff owner',()=>{const s=fs.readFileSync('src/game/game.ts','utf8');assert.match(s,/enemyFinisherDeathAfterglowHandoffPresentation/);assert.match(s,/deathAfterglowHandoff/);});
