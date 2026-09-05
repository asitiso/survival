import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const mod=await import('../dist/game/visual-presence.js').catch(()=>({}));
const spells=['fireBolt','chainLightning','frostNova','flameField','meteorStorm','blackHole'];

test('phase 1071-1072 six spells preserve distinct temporal echo cadence identities',()=>{
  assert.equal(typeof mod.spellEchoCadenceProfile,'function');
  const p=spells.map(s=>mod.spellEchoCadenceProfile(s,10,'high',false));
  assert.equal(new Set(p.map(x=>x.cadence)).size,6);
});

test('phase 1073-1074 echo cadence remains short and bounded',()=>{
  for(const spell of spells) for(const level of [1,5,10]) for(const q of ['high','medium','low']){
    const p=mod.spellEchoCadenceProfile(spell,level,q,false);
    assert.ok(p.delayStep<=.055); assert.ok(p.delayStep>=0);
    assert.ok(p.alphaScales.length>=1&&p.alphaScales.length<=5);
    assert.equal(p.alphaScales.length,p.ttlScales.length);
    assert.ok(p.alphaScales.every(v=>v>=.34&&v<=1));
    assert.ok(p.ttlScales.every(v=>v>=.55&&v<=1));
  }
});

test('phase 1075-1076 critical threat shortens decorative cadence first',()=>{
  const normal=mod.spellEchoCadenceProfile('blackHole',10,'high',false);
  const threat=mod.spellEchoCadenceProfile('blackHole',10,'high',true);
  assert.ok(threat.alphaScales.length<=normal.alphaScales.length);
  assert.ok(threat.delayStep<=normal.delayStep);
});

test('phase 1077-1078 Game applies cadence to existing spell echo trails',()=>{
  const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(source,/spellEchoCadenceProfile\(spellId/);
  assert.match(source,/cadence\.alphaScales/);
  assert.match(source,/cadence\.ttlScales/);
});
