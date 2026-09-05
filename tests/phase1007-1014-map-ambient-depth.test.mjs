import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const mod=await import('../dist/game/visual-presence.js').catch(()=>({}));
const maps=['ruinedGate','frozenFen','crystalQuarry'];

test('phase 1007-1008 maps have distinct secondary ambient motion identities',()=>{
  assert.equal(typeof mod.mapAmbientDepthProfile,'function');
  const p=maps.map(m=>mod.mapAmbientDepthProfile(m,2,'high',false));
  assert.equal(new Set(p.map(x=>x.motion)).size,3);
  assert.equal(new Set(p.map(x=>x.secondaryColor)).size,3);
});
test('phase 1009-1010 evolution adds depth layers but caps them at three',()=>{
  for(const m of maps){
    const s0=mod.mapAmbientDepthProfile(m,0,'high',false),s1=mod.mapAmbientDepthProfile(m,1,'high',false),s2=mod.mapAmbientDepthProfile(m,2,'high',false);
    assert.ok(s0.layers<=s1.layers&&s1.layers<=s2.layers);assert.ok(s2.layers<=3);
  }
});
test('phase 1011-1012 low quality and critical threat reduce ambient density',()=>{
  const high=mod.mapAmbientDepthProfile('frozenFen',2,'high',false);
  const threat=mod.mapAmbientDepthProfile('frozenFen',2,'high',true);
  const low=mod.mapAmbientDepthProfile('frozenFen',2,'low',true);
  assert.ok(threat.particlesPerSecond<high.particlesPerSecond);assert.ok(low.particlesPerSecond<=threat.particlesPerSecond);
});
test('phase 1013-1014 Game map VFX consumes ambient depth profile',()=>{
  const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(source,/mapAmbientDepthProfile\(this\.terrain\.currentLayout\.id/);
  assert.match(source,/ambient\.secondaryColor/);
});
