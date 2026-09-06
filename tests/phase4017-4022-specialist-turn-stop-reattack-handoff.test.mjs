import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as finish from '../dist/game/specialist-strike-impact-side-finish-rendering.js';
const fn=finish.specialistTurnStopReattackHandoffPresentation;
test('turn stop reattack handoff helper exists',()=>assert.equal(typeof fn,'function'));
test('turn owner retains turn emphasis before reattack',()=>{const p=fn?.({owner:'turn',cadenceScale:.52,reattackScale:.2,motionBlend:.6},false);assert.ok(p);assert.equal(p.owner,'turn');assert.ok(p.turnStopScale>.6);});
test('reattack owner crossfades cadence and turn stop',()=>{const p=fn?.({owner:'reattack',cadenceScale:.82,reattackScale:.88,motionBlend:.55},false);assert.ok(p);assert.equal(p.owner,'handoff');assert.ok(p.cadenceScale>.5&&p.turnStopScale>0);});
test('locomotion owner restores canonical cadence',()=>{const p=fn?.({owner:'locomotion',cadenceScale:.96,reattackScale:.2,motionBlend:.9},false);assert.ok(p);assert.equal(p.owner,'locomotion');assert.equal(p.cadenceScale,1);});
test('reduced motion lowers overlap not body visibility',()=>{const a=fn?.({owner:'reattack',cadenceScale:.8,reattackScale:.8,motionBlend:.5},false),b=fn?.({owner:'reattack',cadenceScale:.8,reattackScale:.8,motionBlend:.5},true);assert.ok(a&&b);assert.ok(b.turnStopScale<=a.turnStopScale);assert.equal(b.bodyAlphaScale,1);});
test('live specialist renderer composes turn stop reattack handoff',()=>{const s=fs.readFileSync('src/game/enemies.ts','utf8');assert.match(s,/specialistTurnStopReattackHandoffPresentation/);assert.match(s,/specialistTurnStopHandoff/);});
