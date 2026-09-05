import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { SPELL_EVOLUTION_CREST_IDS,SPELL_EVOLUTION_CREST_ATLAS,spellEvolutionCrestIcon,auditSpellEvolutionCrestAtlas } from '../dist/game/spell-evolution-identity-assets.js';

test('phase 2111 provides eight static unique hero evolution crests in a 4x2 atlas',()=>{
  assert.equal(fs.existsSync(new URL('../assets/ui/spell-evolution-crests.png',import.meta.url)),true);
  assert.deepEqual(SPELL_EVOLUTION_CREST_IDS,['arkan:awakened','seria:awakened','kain:awakened','edric:awakened','arkan:final','seria:final','kain:final','edric:final']);
  assert.deepEqual(SPELL_EVOLUTION_CREST_ATLAS,{src:'./assets/ui/spell-evolution-crests.png',columns:4,rows:2,cellSize:96,width:384,height:192});
  const icons=SPELL_EVOLUTION_CREST_IDS.map(spellEvolutionCrestIcon);
  assert.equal(new Set(icons.map(v=>`${v.sx}:${v.sy}`)).size,8);
  for(const icon of icons){assert.equal(icon.animated,false);assert.equal(icon.motionAmplitude,0);assert.equal(icon.textFallbackPreserved,true);assert.equal(icon.loadFailureBlocksGameplay,false);}
  const audit=auditSpellEvolutionCrestAtlas();assert.equal(audit.coverage,1);assert.equal(audit.uniqueCellCount,8);assert.deepEqual(audit.outOfBounds,[]);assert.equal(audit.passed,true);
});
