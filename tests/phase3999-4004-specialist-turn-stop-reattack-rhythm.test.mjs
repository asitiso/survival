import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as finish from '../dist/game/specialist-strike-impact-side-finish-rendering.js';
const fn=finish.specialistLocomotionTurnStopReattackRhythmPresentation;
test('specialist turn stop reattack rhythm helper exists',()=>assert.equal(typeof fn,'function'));
test('moving specialist keeps canonical cadence',()=>{const p=fn?.({type:'assassin',motionBlend:.9,turn:.05,recovery:.04,attackReadiness:.1},false);assert.ok(p);assert.equal(p.owner,'locomotion');assert.ok(p.cadenceScale>.85);});
test('hard turn suppresses stride before reattack cue',()=>{const p=fn?.({type:'shieldbearer',motionBlend:.72,turn:.92,recovery:.18,attackReadiness:.3},false);assert.ok(p);assert.equal(p.owner,'turn');assert.ok(p.cadenceScale<.75);assert.ok(p.turnEmphasis>.5);});
test('full stop yields cadence to planted stop',()=>{const p=fn?.({type:'siegeGolem',motionBlend:.08,turn:.1,recovery:.86,attackReadiness:.15},false);assert.ok(p);assert.equal(p.owner,'stop');assert.ok(p.stopEmphasis>.6);});
test('reattack readiness restores forward rhythm without overshoot',()=>{const p=fn?.({type:'nullifier',motionBlend:.48,turn:.18,recovery:.3,attackReadiness:.9},false);assert.ok(p);assert.equal(p.owner,'reattack');assert.ok(p.reattackScale>.65&&p.reattackScale<=1);});
test('live specialist silhouette consumes rhythm owner',()=>{const s=fs.readFileSync('src/game/enemies.ts','utf8');assert.match(s,/specialistLocomotionTurnStopReattackRhythmPresentation/);assert.match(s,/specialistTurnStopRhythm/);});
