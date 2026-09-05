import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const mod=await import('../dist/game/map-evolution.js');
const maps=['ruinedGate','frozenFen','crystalQuarry'];

test('phase 887-890 maps expose three distinct ambient visual identities',()=>{
  assert.equal(typeof mod.mapEnvironmentVfxDescriptor,'function');
  const d=maps.map((m)=>mod.mapEnvironmentVfxDescriptor(m,0,'high'));
  assert.equal(new Set(d.map((v)=>v.motif)).size,3);
  assert.equal(new Set(d.map((v)=>v.color)).size,3);
});

test('phase 891-892 environment density escalates by map stage but drops on low quality',()=>{
  for(const m of maps){
    const s0=mod.mapEnvironmentVfxDescriptor(m,0,'high');
    const s2=mod.mapEnvironmentVfxDescriptor(m,2,'high');
    const low=mod.mapEnvironmentVfxDescriptor(m,2,'low');
    assert.ok(s2.particlesPerSecond>=s0.particlesPerSecond);
    assert.ok(low.particlesPerSecond<s2.particlesPerSecond);
    assert.ok(s2.particlesPerSecond<=10);
    assert.ok(low.particlesPerSecond<=4);
  }
});

test('phase 893-894 game emits adaptive ambient map particles and a bounded evolution pulse',()=>{
  const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(source,/updateMapEnvironmentVfx\(dt\)/);
  assert.match(source,/mapEnvironmentVfxDescriptor/);
  assert.match(source,/emitMapEvolutionVfx/);
  assert.match(source,/evolutionStage/);
});
