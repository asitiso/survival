import test from 'node:test';
import assert from 'node:assert/strict';
import * as mapVfx from '../dist/game/map-evolution.js';
import { TerrainSystem } from '../dist/game/terrain.js';

test('phase 927-930 environment destruction profiles vary by map and quality',()=>{
  assert.equal(typeof mapVfx.environmentDestructionVfxDescriptor,'function');
  const maps=['ruinedGate','frozenFen','crystalQuarry'];
  const high=maps.map((m)=>mapVfx.environmentDestructionVfxDescriptor(m,'evolutionCollapse',2,'high'));
  const low=maps.map((m)=>mapVfx.environmentDestructionVfxDescriptor(m,'evolutionCollapse',2,'low'));
  assert.equal(new Set(high.map((p)=>p.motif)).size,3);
  for(let i=0;i<maps.length;i++) assert.ok(low[i].debrisCount<high[i].debrisCount);
  assert.ok(high.every((p)=>p.debrisCount<=18&&p.waveCount<=3&&p.glowAlpha<=0.30));
});

test('phase 931-932 crystal blast creates a drainable presentation event',()=>{
  const terrain=new TerrainSystem();
  terrain.restore('crystalQuarry',2);
  const crystal=terrain.crystals[0];
  assert.ok(crystal);
  terrain.hitByMagic({x:crystal.x,y:crystal.y},999);
  terrain.update(0.016,{enemies:[],applySlow(){},damage(){return false;}});
  assert.equal(typeof terrain.drainPresentationEvents,'function');
  const events=terrain.drainPresentationEvents();
  assert.equal(events.length,1);
  assert.equal(events[0].kind,'crystalBlast');
  assert.ok(events[0].radius>0);
});

test('phase 933-934 crystal blast and evolution collapse have distinct destruction signatures',()=>{
  const crystal=mapVfx.environmentDestructionVfxDescriptor('crystalQuarry','crystalBlast',2,'high');
  const collapse=mapVfx.environmentDestructionVfxDescriptor('crystalQuarry','evolutionCollapse',2,'high');
  assert.notEqual(crystal.motion,collapse.motion);
  assert.notEqual(crystal.rayCount,collapse.rayCount);
});
