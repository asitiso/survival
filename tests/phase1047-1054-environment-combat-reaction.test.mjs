import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const mod=await import('../dist/game/visual-presence.js').catch(()=>({}));
const maps=['ruinedGate','frozenFen','crystalQuarry'];
const spells=['fireBolt','chainLightning','frostNova','flameField','meteorStorm','blackHole'];

test('phase 1047-1048 environment combat reaction is map-specific and spell-aware',()=>{
  assert.equal(typeof mod.mapCombatReactionProfile,'function');
  const mapMotions=maps.map(m=>mod.mapCombatReactionProfile(m,'fireBolt','high',false).motion);
  assert.equal(new Set(mapMotions).size,3);
  const reactions=spells.map(s=>mod.mapCombatReactionProfile('crystalQuarry',s,'high',false).accent);
  assert.ok(new Set(reactions).size>=3);
});

test('phase 1049-1050 environment reaction remains strictly decorative and bounded',()=>{
  for(const map of maps) for(const spell of spells) for(const q of ['high','medium','low']){
    const p=mod.mapCombatReactionProfile(map,spell,q,false);
    assert.ok(p.particleCount<=6); assert.ok(p.alpha<=.18); assert.ok(p.ttl<=.48); assert.ok(p.speed<=92);
  }
});

test('phase 1051-1052 critical threat sheds environment reaction before combat cues',()=>{
  const full=mod.mapCombatReactionProfile('ruinedGate','meteorStorm','high',false);
  const threat=mod.mapCombatReactionProfile('ruinedGate','meteorStorm','high',true);
  assert.ok(threat.particleCount<full.particleCount); assert.ok(threat.alpha<full.alpha); assert.ok(threat.particleCount>=1);
});

test('phase 1053-1054 Game couples spell cast to local map reaction without telegraph emission',()=>{
  const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(source,/mapCombatReactionProfile\(this\.terrain\.currentLayout\.id,spellId/);
  const block=source.slice(source.indexOf('mapCombatReactionProfile(this.terrain.currentLayout.id,spellId'),source.indexOf('mapCombatReactionProfile(this.terrain.currentLayout.id,spellId')+1400);
  assert.doesNotMatch(block,/emitTelegraph/);
});
