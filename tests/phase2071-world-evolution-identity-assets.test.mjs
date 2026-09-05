import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WORLD_EVOLUTION_IDENTITY_IDS,
  WORLD_EVOLUTION_IDENTITY_ATLAS,
  worldEvolutionIdentityIcon,
  auditWorldEvolutionIdentityAtlas,
} from '../dist/game/endless/world-evolution-identity-assets.js';

test('phase 2071 provides five static unique world evolution identities in a 3x2 atlas',()=>{
  assert.deepEqual(WORLD_EVOLUTION_IDENTITY_IDS,['stormfront','ruins','mana_bloom','blood_moon','sanctuary']);
  assert.deepEqual(WORLD_EVOLUTION_IDENTITY_ATLAS,{src:'./assets/ui/world-evolution-icons.png',columns:3,rows:2,cellSize:96,width:288,height:192});
  const cells=WORLD_EVOLUTION_IDENTITY_IDS.map(id=>worldEvolutionIdentityIcon(id));
  assert.equal(new Set(cells.map(v=>`${v.sx}:${v.sy}`)).size,5);
  for(const icon of cells){
    assert.equal(icon.animated,false);
    assert.equal(icon.motionAmplitude,0);
    assert.equal(icon.maxVisibleRecallIcons,1);
    assert.equal(icon.textFallbackPreserved,true);
    assert.equal(icon.loadFailureBlocksGameplay,false);
  }
  const audit=auditWorldEvolutionIdentityAtlas();
  assert.equal(audit.coverage,1);
  assert.equal(audit.uniqueCellCount,5);
  assert.deepEqual(audit.outOfBounds,[]);
  assert.equal(audit.passed,true);
});
