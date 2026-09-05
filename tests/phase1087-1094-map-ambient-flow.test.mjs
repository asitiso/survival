import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const mod=await import('../dist/game/visual-presence.js').catch(()=>({}));
const maps=['ruinedGate','frozenFen','crystalQuarry'];

test('phase 1087-1088 maps expose distinct bounded ambient flow identities',()=>{
  assert.equal(typeof mod.mapAmbientFlowProfile,'function');
  const p=maps.map(m=>mod.mapAmbientFlowProfile(m,2,1.3,false));
  assert.equal(new Set(p.map(x=>x.flow)).size,3);
  for(const x of p){assert.ok(x.speedScale<=1.15);assert.ok(x.turbulence<=.28);assert.ok(Math.abs(x.x)<=1);assert.ok(Math.abs(x.y)<=1);}
});

test('phase 1089-1090 evolution deepens flow without exceeding safe bounds',()=>{
  for(const map of maps){
    const a=mod.mapAmbientFlowProfile(map,0,.7,false),b=mod.mapAmbientFlowProfile(map,2,.7,false);
    assert.ok(b.depthScale>=a.depthScale); assert.ok(b.depthScale<=1.18);
  }
});

test('phase 1091-1092 critical threat calms ambient turbulence first',()=>{
  const normal=mod.mapAmbientFlowProfile('crystalQuarry',2,2.2,false);
  const threat=mod.mapAmbientFlowProfile('crystalQuarry',2,2.2,true);
  assert.ok(threat.turbulence<normal.turbulence); assert.ok(threat.speedScale<=normal.speedScale);
});

test('phase 1093-1094 Game ambient VFX consumes flow profile',()=>{
  const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(source,/mapAmbientFlowProfile\(this\.terrain\.currentLayout\.id/);
  assert.match(source,/ambientFlow\.turbulence/); assert.match(source,/ambientFlow\.speedScale/);
});
