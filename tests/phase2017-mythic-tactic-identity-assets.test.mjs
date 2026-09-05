import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  MYTHIC_TACTIC_IDENTITY_ATLAS,
  MYTHIC_TACTIC_IDENTITY_IDS,
  auditMythicTacticIdentityAtlas,
  mythicTacticIdentityIcon,
  mythicTacticIdentityIdForArchetype,
} from '../dist/game/endless/mythic-tactic-identity-assets.js';

const expected=['ember','brood','iron','void','twin','time'];
const archetypes=['inferno','summoner','juggernaut','abyssWitch','twinMaw','timeEater'];

test('phase 2017 mythic tactic atlas covers six tactic families in six unique static cells',()=>{
  assert.deepEqual([...MYTHIC_TACTIC_IDENTITY_IDS],expected);
  assert.deepEqual(MYTHIC_TACTIC_IDENTITY_ATLAS,{src:'./assets/ui/mythic-tactic-icons.png',columns:3,rows:2,cellSize:96,width:288,height:192});
  assert.equal(fs.existsSync(new URL('../assets/ui/mythic-tactic-icons.png',import.meta.url)),true);
  const cells=new Set();
  archetypes.forEach((archetype,index)=>assert.equal(mythicTacticIdentityIdForArchetype(archetype),expected[index]));
  for(const id of MYTHIC_TACTIC_IDENTITY_IDS){
    const icon=mythicTacticIdentityIcon(id); cells.add(`${icon.sx}:${icon.sy}`);
    assert.equal(icon.id,id); assert.equal(icon.sw,96); assert.equal(icon.sh,96);
    assert.equal(icon.animated,false); assert.equal(icon.motionAmplitude,0);
    assert.equal(icon.rewardIdentitySupported,true); assert.equal(icon.primedIdentitySupported,true); assert.equal(icon.consumedIdentitySupported,true);
    assert.equal(icon.textFallbackPreserved,true); assert.equal(icon.loadFailureBlocksGameplay,false);
    assert.ok(icon.sx>=0&&icon.sy>=0&&icon.sx+icon.sw<=288&&icon.sy+icon.sh<=192);
  }
  assert.equal(cells.size,6);
  const audit=auditMythicTacticIdentityAtlas();
  assert.equal(audit.itemCount,6); assert.equal(audit.coverage,1); assert.equal(audit.uniqueCellCount,6); assert.deepEqual(audit.outOfBounds,[]); assert.equal(audit.passed,true);
});
