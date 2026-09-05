import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PresentationRuntime, screenEffectScale } from '../dist/game/presentation-runtime.js';
import { cosmeticMotionVelocity } from '../dist/game/presentation-settings.js';

test('phase 1906 screen effects preserve visibility while reduced motion freezes radial expansion independently of reduced flash',()=>{
  assert.equal(screenEffectScale('shockwave',0,false),0.48);
  assert.ok(screenEffectScale('shockwave',1,false)>1);
  assert.equal(screenEffectScale('shockwave',0.75,true),1);
});

test('phase 1907 presentation runtime can freeze particle displacement without freezing ttl cleanup',()=>{
  const runtime=new PresentationRuntime('high');
  runtime.emitParticle({x:10,y:20,vx:100,vy:-50,color:'#fff',ttl:.2});
  runtime.update(.1,1,0);
  assert.equal(runtime.particleSnapshot[0].x,10);
  assert.equal(runtime.particleSnapshot[0].y,20);
  runtime.update(.11,1,0);
  assert.equal(runtime.particleSnapshot.length,0);
});

test('phase 1908 cosmetic velocity helper stops drift but preserves normal values',()=>{
  assert.equal(cosmeticMotionVelocity(88,false),88);
  assert.equal(cosmeticMotionVelocity(88,true),0);
  assert.equal(cosmeticMotionVelocity(-34,true),0);
});

test('phase 1909 game routes reduced motion into boss, death, ultimate, map, flow and presentation runtime paths',()=>{
  const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  for(const token of [
    'this.presentationSettings.reducedMotion',
    'cosmeticMotionVelocity',
    'renderDecorative(ctx, this.presentationSettings.reducedMotion)',
    'renderScreenEffects(ctx, this.presentationSettings.reducedFlash, this.presentationSettings.reducedMotion)',
    'this.presentation.update(dt, this.flowImpactTimer > 0 ? .1 : 1, cosmeticMotionScale(this.presentationSettings))',
  ]) assert.match(game,new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  assert.match(game,/updateMapEnvironmentVfx/);
  assert.match(game,/emitMapEvolutionVfx/);
  assert.match(game,/emitDeathPresentation/);
  assert.match(game,/ultimateAftermathProfile/);
  assert.match(game,/bossLifecycleCinematicProfile/);
  assert.match(game,/flowImpactProfile/);
});

test('phase 1910 reduced motion remains independent from flash and shake in render routing',()=>{
  const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(game,/renderScreenEffects\(ctx, this\.presentationSettings\.reducedFlash, this\.presentationSettings\.reducedMotion\)/);
  assert.match(game,/const shakeScale = this\.presentationSettings\.reducedShake \? 0\.4 : 1/);
});
