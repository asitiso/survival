import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const mod=await import('../dist/game/visual-presence.js').catch(()=>({}));
const bosses=['inferno','summoner','juggernaut','abyssWitch','twinMaw','timeEater'];

test('phase 1079-1080 boss pressure breathing keeps archetype phase identity',()=>{
  assert.equal(typeof mod.bossPressureEnvelope,'function');
  const values=bosses.map(b=>mod.bossPressureEnvelope(b,.2,1.25,'high',false).edgeScale);
  assert.ok(new Set(values.map(v=>v.toFixed(3))).size>=3);
});

test('phase 1081-1082 pressure breathing stays restrained across hp tiers',()=>{
  for(const boss of bosses) for(const ratio of [.8,.45,.18]) for(const t of [0,.2,.8,1.6]){
    const p=mod.bossPressureEnvelope(boss,ratio,t,'high',false);
    assert.ok(p.edgeScale>=.68&&p.edgeScale<=1); assert.ok(p.glowScale>=.62&&p.glowScale<=1); assert.ok(p.lineWidthScale>=.9&&p.lineWidthScale<=1.12);
  }
});

test('phase 1083-1084 reduced flash narrows boss breathing modulation',()=>{
  const full=mod.bossPressureEnvelope('timeEater',.18,.37,'high',false);
  const reduced=mod.bossPressureEnvelope('timeEater',.18,.37,'high',true);
  assert.ok(Math.abs(1-reduced.edgeScale)<=Math.abs(1-full.edgeScale)+.001);
});

test('phase 1085-1086 Game boss pressure renderer consumes envelope instead of raw global sine',()=>{
  const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(source,/bossPressureEnvelope\(/);
  const start=source.indexOf('private drawBossHealthPressure');
  const block=source.slice(start,start+1800);
  assert.match(block,/envelope\.edgeScale/); assert.match(block,/envelope\.glowScale/);
});
