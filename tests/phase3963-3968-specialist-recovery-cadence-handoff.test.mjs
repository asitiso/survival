import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import * as finish from '../dist/game/specialist-strike-impact-side-finish-rendering.js';
const fn=finish.specialistRecoveryLocomotionCadenceHandoffPresentation;
test('specialist recovery cadence handoff helper exists',()=>assert.equal(typeof fn,'function'));
test('recovery owner keeps locomotion cadence muted',()=>{const p=fn?.({owner:'recovery',recoveryBlend:.35,motionBlend:.7,cadenceScale:.2},false);assert.ok(p);assert.equal(p.owner,'recovery');assert.ok(p.signatureAlphaScale<.5);});
test('handoff crossfades trail and cadence without exceeding unity budget',()=>{const p=fn?.({owner:'handoff',recoveryBlend:.66,motionBlend:.8,cadenceScale:.72},false);assert.ok(p);assert.equal(p.owner,'handoff');assert.ok(p.trailAlphaScale>0&&p.signatureAlphaScale>0);assert.ok(p.trailAlphaScale+p.signatureAlphaScale<=1.35);});
test('locomotion owner restores signature and cadence completely',()=>{const p=fn?.({owner:'locomotion',recoveryBlend:.96,motionBlend:.85,cadenceScale:1},false);assert.ok(p);assert.equal(p.owner,'locomotion');assert.equal(p.signatureAlphaScale,1);assert.equal(p.cadenceScale,1);});
test('reduced motion shortens overlap during cadence handoff',()=>{const a=fn?.({owner:'handoff',recoveryBlend:.62,motionBlend:.8,cadenceScale:.7},false),b=fn?.({owner:'handoff',recoveryBlend:.62,motionBlend:.8,cadenceScale:.7},true);assert.ok(a&&b);assert.ok(b.trailAlphaScale<=a.trailAlphaScale);});
test('live specialist renderer composes recovery cadence handoff',()=>{const s=fs.readFileSync('src/game/enemies.ts','utf8');assert.match(s,/specialistRecoveryLocomotionCadenceHandoffPresentation/);assert.match(s,/specialistRecoveryCadenceHandoff/);});
