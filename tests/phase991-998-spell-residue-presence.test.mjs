import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const mod=await import('../dist/game/visual-presence.js').catch(()=>({}));
const spells=['fireBolt','chainLightning','frostNova','flameField','meteorStorm','blackHole'];

test('phase 991-992 all six spells have distinct residue motion identities',()=>{
  assert.equal(typeof mod.spellResidueProfile,'function');
  const profiles=spells.map(s=>mod.spellResidueProfile(s,10,'high',false));
  assert.equal(new Set(profiles.map(p=>p.motion)).size,6);
});
test('phase 993-994 spell residue escalates by level without exceeding release bounds',()=>{
  for(const s of spells){
    const l1=mod.spellResidueProfile(s,1,'high',false),l5=mod.spellResidueProfile(s,5,'high',false),l10=mod.spellResidueProfile(s,10,'high',false);
    assert.ok(l1.count<=l5.count&&l5.count<=l10.count);
    for(const p of [l1,l5,l10]){assert.ok(p.count<=8);assert.ok(p.alpha<=.20);assert.ok(p.ttl<=.72);}
  }
});
test('phase 995-996 threat and low quality shed residue before gameplay cues',()=>{
  const normal=mod.spellResidueProfile('meteorStorm',10,'high',false);
  const threatened=mod.spellResidueProfile('meteorStorm',10,'high',true);
  const low=mod.spellResidueProfile('meteorStorm',10,'low',true);
  assert.ok(threatened.count<normal.count); assert.ok(low.count<=threatened.count); assert.ok(low.count>=1);
});
test('phase 997-998 Game emits spell residue from the existing cast presentation path',()=>{
  const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(source,/spellResidueProfile\(spellId/);
  assert.match(source,/residue\.count/);
});
