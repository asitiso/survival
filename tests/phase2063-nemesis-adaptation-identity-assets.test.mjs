import test from 'node:test';
import assert from 'node:assert/strict';
import { NEMESIS_ADAPTATION_IDENTITY_IDS,NEMESIS_ADAPTATION_IDENTITY_ATLAS,nemesisAdaptationIdentityIcon,auditNemesisAdaptationIdentityAtlas } from '../dist/game/endless/nemesis-adaptation-identity-assets.js';

test('phase 2063 provides five static unique nemesis adaptation identities in a 3x2 atlas',()=>{
  assert.deepEqual(NEMESIS_ADAPTATION_IDENTITY_IDS,['spell_guard','blink_hunt','core_siege','enrage_clock','mirror_affinity']);
  assert.deepEqual(NEMESIS_ADAPTATION_IDENTITY_ATLAS,{src:'./assets/ui/nemesis-adaptation-icons.png',columns:3,rows:2,cellSize:96,width:288,height:192});
  const cells=NEMESIS_ADAPTATION_IDENTITY_IDS.map(id=>nemesisAdaptationIdentityIcon(id));
  assert.equal(new Set(cells.map(v=>`${v.sx}:${v.sy}`)).size,5);
  for(const icon of cells){ assert.equal(icon.animated,false); assert.equal(icon.motionAmplitude,0); assert.equal(icon.maxVisibleRecallIcons,3); assert.equal(icon.textFallbackPreserved,true); assert.equal(icon.loadFailureBlocksGameplay,false); }
  const audit=auditNemesisAdaptationIdentityAtlas(); assert.equal(audit.coverage,1); assert.equal(audit.uniqueCellCount,5); assert.deepEqual(audit.outOfBounds,[]); assert.equal(audit.passed,true);
});
