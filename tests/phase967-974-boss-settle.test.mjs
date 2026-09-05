import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { bossSettleProfile } from '../dist/game/visual-rhythm.js';

test('phase 967-969 six boss settle profiles preserve archetype identity',()=>{
  const ids=['inferno','summoner','juggernaut','abyssWitch','twinMaw','timeEater'];
  const profiles=ids.map((id)=>bossSettleProfile(id,'high'));
  assert.equal(new Set(profiles.map((p)=>p.motif)).size,6);
  assert.ok(profiles.every((p)=>p.alpha<=0.18&&p.rayCount<=8&&p.ttl<=0.8));
});

test('phase 970-972 low quality preserves settle motif while reducing density',()=>{
  const hi=bossSettleProfile('timeEater','high'), lo=bossSettleProfile('timeEater','low');
  assert.equal(hi.motif,lo.motif);
  assert.ok(lo.rayCount<hi.rayCount);
  assert.ok(lo.alpha<hi.alpha);
});

test('phase 973-974 boss death runtime emits settle after lifecycle burst',()=>{
  const src=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  const start=src.indexOf("if(death.type==='boss')");
  const block=src.slice(start,start+2600);
  assert.match(block,/bossSettleProfile/);
  assert.ok(block.indexOf('bossLifecycleCinematicProfile')<block.indexOf('bossSettleProfile'));
});
