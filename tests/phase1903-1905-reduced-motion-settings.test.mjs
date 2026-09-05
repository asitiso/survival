import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { defaultPresentationSettings, loadPresentationSettings, sanitizePresentationSettings, cosmeticMotionScale } from '../dist/game/presentation-settings.js';

test('phase 1903 reduced motion is an independent persisted presentation setting',()=>{
  const defaults=defaultPresentationSettings(false);
  assert.equal(defaults.reducedMotion,false);
  assert.equal(cosmeticMotionScale(defaults),1);
  const reduced={...defaults,reducedMotion:true,reducedFlash:false,reducedShake:false};
  assert.equal(cosmeticMotionScale(reduced),0);
});

test('phase 1904 OS reduced-motion preference defaults motion flash and shake without coupling later toggles',()=>{
  const settings=loadPresentationSettings({getItem:()=>null},true);
  assert.equal(settings.reducedMotion,true);
  assert.equal(settings.reducedFlash,true);
  assert.equal(settings.reducedShake,true);
  settings.reducedFlash=false;
  assert.equal(settings.reducedMotion,true);
});

test('phase 1905 legacy four-field settings migrate reducedMotion without discarding explicit preferences',()=>{
  const legacyReduced=sanitizePresentationSettings({quality:'medium',reducedFlash:true,reducedShake:true,haptics:false});
  assert.equal(legacyReduced.reducedMotion,true);
  assert.equal(legacyReduced.quality,'medium');
  assert.equal(legacyReduced.haptics,false);
  const legacyMixed=sanitizePresentationSettings({quality:'high',reducedFlash:true,reducedShake:false,haptics:true});
  assert.equal(legacyMixed.reducedMotion,false);
  const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(game,/MOTION \$\{this\.presentationSettings\.reducedMotion \? 'LOW' : 'ON'\}/);
});
