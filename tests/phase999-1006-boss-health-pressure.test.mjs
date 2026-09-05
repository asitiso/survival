import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const mod=await import('../dist/game/visual-presence.js').catch(()=>({}));
const bosses=['inferno','summoner','juggernaut','abyssWitch','twinMaw','timeEater'];

test('phase 999-1000 boss health pressure has calm strained desperate tiers',()=>{
  assert.equal(typeof mod.bossHealthPressureProfile,'function');
  assert.equal(mod.bossHealthPressureProfile('inferno',.8,'high',false).tier,'calm');
  assert.equal(mod.bossHealthPressureProfile('inferno',.45,'high',false).tier,'strained');
  assert.equal(mod.bossHealthPressureProfile('inferno',.18,'high',false).tier,'desperate');
});
test('phase 1001 boss archetypes preserve six distinct pressure colors',()=>{
  const colors=bosses.map(b=>mod.bossHealthPressureProfile(b,.18,'high',false).color);
  assert.equal(new Set(colors).size,6);
});
test('phase 1002-1003 boss pressure stays subtle and respects reduced flash/quality',()=>{
  for(const b of bosses) for(const q of ['high','medium','low']){
    const p=mod.bossHealthPressureProfile(b,.12,q,false);
    assert.ok(p.edgeAlpha<=.16);assert.ok(p.glowAlpha<=.12);assert.ok(p.pulseHz<=3.2);
  }
  const full=mod.bossHealthPressureProfile('timeEater',.12,'high',false), reduced=mod.bossHealthPressureProfile('timeEater',.12,'low',true);
  assert.ok(reduced.edgeAlpha<full.edgeAlpha);assert.ok(reduced.glowAlpha<full.glowAlpha);
});
test('phase 1004-1006 boss pressure renders below danger vignette and HUD',()=>{
  const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  const pressure=source.indexOf('this.drawBossHealthPressure(ctx)');
  const danger=source.indexOf('this.drawDangerVignette(ctx)');
  const hud=source.indexOf('this.drawHud(ctx)');
  assert.ok(pressure>=0&&danger>pressure&&hud>danger);
});
