import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { deathAfterglowProfile } from '../dist/game/visual-rhythm.js';

test('phase 951-953 death afterglow preserves enemy weight hierarchy with bounded alpha',()=>{
  const grunt=deathAfterglowProfile('grunt','high'), elite=deathAfterglowProfile('elite','high'), boss=deathAfterglowProfile('boss','high');
  assert.ok(grunt.ttl<elite.ttl&&elite.ttl<boss.ttl);
  assert.ok(boss.alpha<=0.22);
  assert.ok(boss.radius<=210);
});

test('phase 954-956 low quality reduces death afterglow density without removing identity',()=>{
  const hi=deathAfterglowProfile('bomber','high'), lo=deathAfterglowProfile('bomber','low');
  assert.equal(hi.motif,lo.motif);
  assert.ok(lo.particleCount<hi.particleCount);
  assert.ok(lo.alpha<hi.alpha);
});

test('phase 957-958 death runtime emits bounded afterglow separately from death burst',()=>{
  const src=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  const start=src.indexOf('private emitDeathPresentation');
  const end=src.indexOf('private updateBossPresentation',start);
  const block=src.slice(start,end);
  assert.match(block,/deathAfterglowProfile/);
  assert.match(block,/kind:'glow'/);
});
