import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as death from '../dist/game/enemy-hit-death-transition-rendering.js';
const fn=death.enemyFinisherDeathAfterglowContinuityPresentation;
test('finisher death afterglow continuity helper exists',()=>assert.equal(typeof fn,'function'));
test('early death keeps body and finisher jointly readable',()=>{const p=fn?.({deathProgress:.18,finisherProgress:.12,tier:'heavy'},false,false);assert.ok(p);assert.equal(p.owner,'reaction');assert.ok(p.bodyAlphaScale>.6);assert.ok(p.finisherAlphaScale>.5);});
test('mid death transfers ownership to finisher afterglow',()=>{const p=fn?.({deathProgress:.58,finisherProgress:.52,tier:'critical'},false,false);assert.ok(p);assert.equal(p.owner,'afterglow');assert.ok(p.afterglowAlphaScale>p.bodyAlphaScale);});
test('late death retires body but preserves afterglow tail',()=>{const p=fn?.({deathProgress:.9,finisherProgress:.72,tier:'normal'},false,false);assert.ok(p);assert.ok(p.bodyAlphaScale<.35);assert.ok(p.afterglowAlphaScale>.2);});
test('reduced flash lowers afterglow without hiding body handoff',()=>{const a=fn?.({deathProgress:.46,finisherProgress:.44,tier:'heavy'},false,false),b=fn?.({deathProgress:.46,finisherProgress:.44,tier:'heavy'},false,true);assert.ok(a&&b);assert.ok(b.afterglowAlphaScale<a.afterglowAlphaScale);assert.ok(b.bodyAlphaScale>0);});
test('live defeat and finisher renderers consume continuity helper',()=>{const s=fs.readFileSync('src/game/game.ts','utf8');assert.match(s,/enemyFinisherDeathAfterglowContinuityPresentation/);assert.match(s,/deathAfterglowContinuity/);});
