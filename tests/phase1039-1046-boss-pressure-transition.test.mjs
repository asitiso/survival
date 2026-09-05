import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const mod=await import('../dist/game/visual-presence.js').catch(()=>({}));
const bosses=['inferno','summoner','juggernaut','abyssWitch','twinMaw','timeEater'];

test('phase 1039-1040 boss pressure transition fires only on strained/desperate threshold crossing',()=>{
  assert.equal(typeof mod.bossPressureTransitionProfile,'function');
  assert.equal(mod.bossPressureTransitionProfile('inferno',.82,.74,'high',false),null);
  assert.equal(mod.bossPressureTransitionProfile('inferno',.62,.52,'high',false).tier,'strained');
  assert.equal(mod.bossPressureTransitionProfile('inferno',.31,.23,'high',false).tier,'desperate');
});

test('phase 1041-1042 boss transition remains restrained and preserves archetype identity',()=>{
  const colors=[];
  for(const boss of bosses){
    const p=mod.bossPressureTransitionProfile(boss,.6,.2,'high',false); colors.push(p.color);
    assert.ok(p.alpha<=.18); assert.ok(p.rayCount<=8); assert.ok(p.ttl<=.38); assert.ok(p.radius<=190);
  }
  assert.equal(new Set(colors).size,6);
});

test('phase 1043 reduced flash and low quality reduce boss transition pulse',()=>{
  const full=mod.bossPressureTransitionProfile('timeEater',.6,.2,'high',false);
  const reduced=mod.bossPressureTransitionProfile('timeEater',.6,.2,'low',true);
  assert.ok(reduced.alpha<full.alpha); assert.ok(reduced.rayCount<=full.rayCount);
});

test('phase 1044-1046 Game tracks previous boss hp ratio and emits transition once',()=>{
  const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(source,/bossPressureRatioById/); assert.match(source,/bossPressureTransitionProfile/); assert.match(source,/bossPressureRatioById\.set/);
});
