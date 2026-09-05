import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const mod=await import('../dist/game/visual-presence.js').catch(()=>({}));
const spells=['fireBolt','chainLightning','frostNova','flameField','meteorStorm','blackHole'];

test('phase 1031-1032 all six spells have distinct cast-to-impact echo shapes',()=>{
  assert.equal(typeof mod.spellEchoContinuityProfile,'function');
  const profiles=spells.map(s=>mod.spellEchoContinuityProfile(s,10,'high',false));
  assert.equal(new Set(profiles.map(p=>p.shape)).size,6);
});

test('phase 1033-1034 echo continuity escalates with spell level and remains bounded',()=>{
  for(const s of spells){
    const a=mod.spellEchoContinuityProfile(s,1,'high',false),b=mod.spellEchoContinuityProfile(s,5,'high',false),c=mod.spellEchoContinuityProfile(s,10,'high',false);
    assert.ok(a.echoCount<=b.echoCount&&b.echoCount<=c.echoCount);
    for(const p of [a,b,c]){assert.ok(p.echoCount<=5);assert.ok(p.alpha<=.18);assert.ok(p.ttl<=.34);assert.ok(p.length<=96);}
  }
});

test('phase 1035-1036 critical threat and low quality shed echo density first',()=>{
  const normal=mod.spellEchoContinuityProfile('blackHole',10,'high',false);
  const threat=mod.spellEchoContinuityProfile('blackHole',10,'high',true);
  const low=mod.spellEchoContinuityProfile('blackHole',10,'low',true);
  assert.ok(threat.echoCount<normal.echoCount); assert.ok(low.echoCount<=threat.echoCount); assert.ok(low.echoCount>=1);
});

test('phase 1037-1038 Game emits spell echo continuity in existing spell cast presentation path',()=>{
  const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(source,/spellEchoContinuityProfile\(spellId/); assert.match(source,/echo\.echoCount/);
});
