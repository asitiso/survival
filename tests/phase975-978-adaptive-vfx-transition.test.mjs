import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createVfxQualityTransition, advanceVfxQualityTransition } from '../dist/game/visual-rhythm.js';

test('phase 975 adaptive VFX downgrades immediately under pressure',()=>{
  let s=createVfxQualityTransition('high');
  s=advanceVfxQualityTransition(s,'low',0.016);
  assert.equal(s.current,'low');
});

test('phase 976-977 adaptive VFX upgrades only after stable dwell and one tier at a time',()=>{
  let s=createVfxQualityTransition('low');
  s=advanceVfxQualityTransition(s,'high',0.6); assert.equal(s.current,'low');
  s=advanceVfxQualityTransition(s,'high',0.7); assert.equal(s.current,'medium');
  s=advanceVfxQualityTransition(s,'high',1.3); assert.equal(s.current,'high');
});

test('phase 978 game routes adaptive quality through the transition state',()=>{
  const src=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(src,/advanceVfxQualityTransition/);
  assert.match(src,/vfxQualityTransition/);
});
