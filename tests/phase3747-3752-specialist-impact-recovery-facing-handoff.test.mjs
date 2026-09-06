import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as finish from '../dist/game/specialist-strike-impact-side-finish-rendering.js';
const fn=finish.specialistImpactRecoveryFacingHandoffPresentation;
test('specialist recovery facing handoff helper exists',()=>assert.equal(typeof fn,'function'));
test('early recovery keeps stored strike recovery facing',()=>{const p=fn?.({storedFacingX:0,storedFacingY:1,currentFacingX:1,currentFacingY:0,recoveryBlend:.1,enemyAlive:true},false);assert.ok(p);assert.ok(Math.abs(p.facingY)>Math.abs(p.facingX));});
test('late recovery follows current locomotion facing',()=>{const p=fn?.({storedFacingX:0,storedFacingY:1,currentFacingX:1,currentFacingY:0,recoveryBlend:.95,enemyAlive:true},false);assert.ok(p);assert.ok(Math.abs(p.facingX)>Math.abs(p.facingY));});
test('recovery facing remains normalized',()=>{const p=fn?.({storedFacingX:0,storedFacingY:3,currentFacingX:4,currentFacingY:0,recoveryBlend:.5,enemyAlive:true},false);assert.ok(p);assert.ok(Math.abs(Math.hypot(p.facingX,p.facingY)-1)<1e-6);});
test('dead specialist does not pull finish toward stale locomotion',()=>{const p=fn?.({storedFacingX:0,storedFacingY:1,currentFacingX:1,currentFacingY:0,recoveryBlend:.95,enemyAlive:false},false);assert.ok(p);assert.equal(p.owner,'stored');});
test('live strike cue tracks enemy id and current render motion facing',()=>{const s=fs.readFileSync('src/game/enemies.ts','utf8');assert.match(s,/enemyId/);assert.match(s,/specialistImpactRecoveryFacingHandoffPresentation/);assert.match(s,/currentRecoveryEnemy/);});
