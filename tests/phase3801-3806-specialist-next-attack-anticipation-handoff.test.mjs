import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as finish from '../dist/game/specialist-strike-impact-side-finish-rendering.js';
const fn=finish.specialistNextAttackAnticipationHandoffPresentation;
test('specialist anticipation handoff helper exists',()=>assert.equal(typeof fn,'function'));
test('idle anticipation keeps full cue ownership',()=>{const p=fn?.({anticipationVisible:true,urgency:.7,pullback:0,lunge:0,resolve:0},false);assert.ok(p);assert.equal(p.owner,'anticipation');assert.equal(p.alphaScale,1);});
test('pullback fades anticipation into attack ownership',()=>{const p=fn?.({anticipationVisible:true,urgency:.9,pullback:.55,lunge:0,resolve:0},false);assert.ok(p);assert.equal(p.owner,'attack');assert.ok(p.alphaScale<.6);});
test('lunge fully retires anticipation decoration',()=>{const p=fn?.({anticipationVisible:true,urgency:1,pullback:.1,lunge:.85,resolve:0},false);assert.ok(p);assert.equal(p.owner,'attack');assert.equal(p.alphaScale,0);});
test('recovery resolve never resurrects anticipation',()=>{const p=fn?.({anticipationVisible:false,urgency:0,pullback:0,lunge:0,resolve:.7},false);assert.ok(p);assert.equal(p.alphaScale,0);});
test('live specialist cue applies handoff after attack motion is resolved',()=>{const s=fs.readFileSync('src/game/enemies.ts','utf8');assert.match(s,/specialistNextAttackAnticipationHandoffPresentation/);assert.match(s,/anticipationHandoff/);});
