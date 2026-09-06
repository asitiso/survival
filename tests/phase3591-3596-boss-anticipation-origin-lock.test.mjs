import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import { bossAnticipationOriginLockPresentation } from '../dist/game/boss-anticipation-origin-lock-rendering.js';
const base={desiredOwner:'ground-rebase',desiredOffsetX:-18,desiredOffsetY:5,rebaseOffsetX:-20,rebaseOffsetY:6,handoffStrength:.8,charge:.85,recovery:.05,stagger:0};
test('active charge preserves ground rebase owner',()=>{const p=bossAnticipationOriginLockPresentation(base,false);assert.equal(p.owner,'ground-rebase');});
test('decaying desired owner is held while special handoff remains strong',()=>{const p=bossAnticipationOriginLockPresentation({...base,desiredOwner:'body',desiredOffsetX:-3,handoffStrength:.72,charge:.75},false);assert.equal(p.owner,'ground-rebase');assert.ok(p.offsetX<-3);});
test('low charge releases lock back to body',()=>{const p=bossAnticipationOriginLockPresentation({...base,desiredOwner:'body',handoffStrength:.2,charge:.08},false);assert.equal(p.owner,'body');});
test('recovery releases ground lock',()=>{const p=bossAnticipationOriginLockPresentation({...base,desiredOwner:'body',recovery:.9},false);assert.equal(p.owner,'body');});
test('stagger releases lock immediately',()=>{const p=bossAnticipationOriginLockPresentation({...base,stagger:.8},false);assert.equal(p.owner,'body');});
test('live warning ring consumes locked offset',()=>{const src=fs.readFileSync('src/game/enemies.ts','utf8');assert.match(src,/bossAnticipationOriginLockPresentation/);assert.match(src,/bossAnticipationOriginLock\.offsetX/);});
