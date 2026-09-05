import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const mod=await import('../dist/game/combat-feedback.js');

test('phase 871-874 ultimate and boss camera profiles are distinct and tightly bounded',()=>{
  assert.equal(typeof mod.cameraPressureProfile,'function');
  const meteor=mod.cameraPressureProfile('meteor');
  const vortex=mod.cameraPressureProfile('vortex');
  const p2=mod.cameraPressureProfile('bossPhase2');
  const p3=mod.cameraPressureProfile('bossPhase3');
  assert.ok(meteor.scaleOffset>0);
  assert.ok(vortex.scaleOffset<0);
  assert.ok(Math.abs(p3.scaleOffset)>=Math.abs(p2.scaleOffset));
  for(const p of [meteor,vortex,p2,p3]){ assert.ok(Math.abs(p.scaleOffset)<=0.03); assert.ok(p.duration<=0.34); }
});

test('phase 875-876 camera pressure decays to neutral and never exceeds scale bounds',()=>{
  const feedback=new mod.CombatFeedbackSystem();
  assert.equal(typeof feedback.addCameraPressure,'function');
  feedback.addCameraPressure('meteor');
  assert.ok(feedback.cameraScaleOffset>0 && feedback.cameraScaleOffset<=0.03);
  feedback.update(1);
  assert.equal(feedback.cameraScaleOffset,0);
  feedback.addCameraPressure('vortex');
  assert.ok(feedback.cameraScaleOffset<0 && feedback.cameraScaleOffset>=-0.03);
});

test('phase 877-878 game applies world camera pressure to ultimates and boss transitions below HUD',()=>{
  const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  const render=source.slice(source.indexOf('private render(): void'),source.indexOf('private updatePresentationQuality'));
  assert.match(render,/cameraScaleOffset/);
  assert.ok(render.indexOf('cameraScaleOffset')<render.indexOf('ctx.restore()'));
  assert.match(source,/addCameraPressure\('meteor'\)/);
  assert.match(source,/addCameraPressure\('vortex'\)/);
  assert.match(source,/addCameraPressure\(cue\.cinematic\.cameraKind\)/);
});
