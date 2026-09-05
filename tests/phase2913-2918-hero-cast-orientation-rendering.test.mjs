import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const gameSource = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
const moduleUrl = new URL('../src/game/hero-cast-orientation-rendering.ts', import.meta.url);

async function loadModule(){ assert.equal(fs.existsSync(moduleUrl), true); return import('../dist/game/hero-cast-orientation-rendering.js'); }

test('phase 2913 hero cast orientation module exists', async()=>{ const mod=await loadModule(); assert.equal(typeof mod.heroCastOrientationPresentation,'function'); });
test('phase 2914 moving cast aligns overlay lead with facing direction', async()=>{ const mod=await loadModule(); const p=mod.heroCastOrientationPresentation({facingX:0,facingY:1,speed:0.9,turn:0.2,cast:1,recover:0},false); assert.ok(p.leadY>p.leadX); assert.ok(Math.abs(p.overlayAngle-Math.PI/2)<0.01); });
test('phase 2915 sharp turn before cast keeps bounded anticipation', async()=>{ const mod=await loadModule(); const p=mod.heroCastOrientationPresentation({facingX:1,facingY:0,speed:1,turn:1,cast:0.85,recover:0},false); assert.ok(Math.abs(p.turnAnticipation)<=0.12); assert.ok(Math.abs(p.bodyRotation)<=0.18); });
test('phase 2916 stationary cast removes locomotion lead but keeps cast focus', async()=>{ const mod=await loadModule(); const p=mod.heroCastOrientationPresentation({facingX:1,facingY:0,speed:0,turn:0,cast:1,recover:0},false); assert.ok(Math.abs(p.locomotionLead)<0.01); assert.ok(p.castFocus>0.8); });
test('phase 2917 recover state returns orientation toward neutral', async()=>{ const mod=await loadModule(); const p=mod.heroCastOrientationPresentation({facingX:1,facingY:0,speed:0.2,turn:0.6,cast:0,recover:1},false); assert.ok(p.recoverReturn>0.5); assert.ok(Math.abs(p.bodyRotation)<0.12); });
test('phase 2918 game integrates orientation presentation and audit remains presentation-only', async()=>{ assert.match(gameSource,/heroCastOrientationPresentation/); assert.match(gameSource,/castOrientation\.overlayAngle/); assert.match(gameSource,/castOrientation\.bodyRotation/); assert.equal(fs.existsSync(new URL('../src/game/hero-cast-orientation-audit.ts',import.meta.url)),true); const mod=await import('../dist/game/hero-cast-orientation-audit.js'); const audit=mod.runHeroCastOrientationAudit(); assert.equal(audit.samples.length,48); assert.equal(audit.actionCount,9); assert.equal(audit.presentationOnly,true); assert.equal(audit.gameplayFormulaMutation,false); assert.equal(audit.snapshotSchemaMutation,false); assert.equal(audit.passed,true); });
