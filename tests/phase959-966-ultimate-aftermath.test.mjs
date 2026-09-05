import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ultimateAftermathProfile } from '../dist/game/visual-rhythm.js';

test('phase 959-961 meteor and black hole aftermaths keep distinct motion identities',()=>{
  const meteor=ultimateAftermathProfile('meteorStorm',10,'high'), hole=ultimateAftermathProfile('blackHole',10,'high');
  assert.notEqual(meteor.motion,hole.motion);
  assert.notEqual(meteor.color,hole.color);
  assert.ok(meteor.ringCount>=2&&hole.ringCount>=2);
});

test('phase 962-964 aftermath remains bounded and scales down on low quality',()=>{
  const hi=ultimateAftermathProfile('meteorStorm',10,'high'), lo=ultimateAftermathProfile('meteorStorm',10,'low');
  assert.ok(hi.alpha<=0.24&&hi.ttl<=0.65&&hi.particleCount<=12&&hi.ringCount<=4);
  assert.ok(lo.particleCount<hi.particleCount);
  assert.ok(lo.alpha<hi.alpha);
});

test('phase 965-966 spell cast runtime emits aftermath for ultimates only',()=>{
  const src=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  const start=src.indexOf('private emitSpellCastVfx');
  const end=src.indexOf('private emitDeathPresentation',start);
  const block=src.slice(start,end);
  assert.match(block,/ultimateAftermathProfile/);
  assert.match(block,/if \(descriptor\.ultimate\)/);
});
