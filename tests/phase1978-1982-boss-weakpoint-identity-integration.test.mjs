import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BossEncounterSystem } from '../dist/game/boss-encounters.js';
import { primaryWeakpointNode } from '../dist/game/auto-target-visibility.js';
import { autoWeakpointAimPoint } from '../dist/game/auto-weakpoint-aim.js';

test('phases 1978-1982 game asynchronously loads boss weakpoint atlas and keeps text fallback', () => {
  const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(source,/BOSS_WEAKPOINT_IDENTITY_ATLAS/);
  assert.match(source,/bossWeakpointIdentityIcon/);
  assert.match(source,/bossWeakpointIdentityAtlasImage/);
  assert.match(source,/bossWeakpointIdentityAtlasReady/);
  assert.match(source,/initializeBossWeakpointIdentityAtlas\(\)/);
  assert.match(source,/image\.src\s*=\s*BOSS_WEAKPOINT_IDENTITY_ATLAS\.src/);
  assert.match(source,/bossWeakpointIdentityAtlasReady\s*&&\s*this\.bossWeakpointIdentityAtlasImage/);
  assert.match(source,/ctx\.drawImage\(this\.bossWeakpointIdentityAtlasImage/);
  assert.match(source,/PYLON/);
  assert.match(source,/PLATE/);
  assert.match(source,/CURSE/);
  assert.match(source,/TIME/);
});

test('phase 1980 primary weakpoint and AUTO selection remain hp-ratio then distance then id', () => {
  const nodes=[
    {id:5,kind:'armorPlate',pos:{x:320,y:300},hp:80,maxHp:100,radius:27,alive:true},
    {id:3,kind:'flamePylon',pos:{x:360,y:300},hp:40,maxHp:100,radius:31,alive:true},
    {id:2,kind:'summonCore',pos:{x:400,y:300},hp:40,maxHp:100,radius:31,alive:true},
  ];
  const hero={x:300,y:300};
  assert.equal(primaryWeakpointNode(nodes,hero)?.id,3);
  const boss={id:77,type:'boss',pos:{x:500,y:300}};
  assert.deepEqual(autoWeakpointAimPoint({autoAim:true,target:boss,heroPos:hero,activeBossId:77,nodes}),nodes[1].pos);
});

test('phases 1978-1982 weakpoint gameplay geometry remains unchanged before rendering integration', () => {
  const inferno=new BossEncounterSystem();
  inferno.begin(1,'inferno',{x:800,y:450},0);
  assert.equal(inferno.nodes[0].maxHp,210);
  assert.equal(inferno.nodes[0].radius,31);
  const juggernaut=new BossEncounterSystem();
  juggernaut.begin(2,'juggernaut',{x:800,y:450},0);
  assert.equal(juggernaut.nodes[0].maxHp,210);
  assert.equal(juggernaut.nodes[0].radius,27);
});
