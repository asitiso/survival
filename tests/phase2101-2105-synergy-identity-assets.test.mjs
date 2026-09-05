import test from 'node:test';
import assert from 'node:assert/strict';
import { SYNERGY_IDENTITY_IDS,SYNERGY_IDENTITY_ATLAS,synergyIdentityIcon,auditSynergyIdentityAtlas } from '../dist/game/synergy-identity-assets.js';

test('phase 2101-2105 provides ten static unique synergy identities in a 4x3 atlas',()=>{
  assert.deepEqual(SYNERGY_IDENTITY_IDS,['forbidden-arcana','broken-time','last-bastion','starbreaker','golden-fever','overclock','ember-dominion','winter-dominion','storm-dominion','oath-dominion']);
  assert.deepEqual(SYNERGY_IDENTITY_ATLAS,{src:'./assets/ui/synergy-icons.png',columns:4,rows:3,cellSize:96,width:384,height:288});
  const icons=SYNERGY_IDENTITY_IDS.map(synergyIdentityIcon);
  assert.equal(new Set(icons.map(v=>`${v.sx}:${v.sy}`)).size,10);
  for(const icon of icons){assert.equal(icon.animated,false);assert.equal(icon.motionAmplitude,0);assert.equal(icon.textFallbackPreserved,true);assert.equal(icon.loadFailureBlocksGameplay,false);}
  const audit=auditSynergyIdentityAtlas();assert.equal(audit.coverage,1);assert.equal(audit.uniqueCellCount,10);assert.deepEqual(audit.outOfBounds,[]);assert.equal(audit.passed,true);
});
