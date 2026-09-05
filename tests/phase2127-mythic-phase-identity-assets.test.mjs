import test from 'node:test'; import assert from 'node:assert/strict';
import { MYTHIC_PHASE_IDENTITY_ATLAS,MYTHIC_PHASE_IDENTITY_IDS,mythicPhaseIdentityIcon,mythicPhasePressureSegments,auditMythicPhaseIdentityAtlas } from '../dist/game/endless/mythic-phase-identity-assets.js';
test('phase 2127 provides three static Mythic Phase crest identities',()=>{
  assert.deepEqual([...MYTHIC_PHASE_IDENTITY_IDS],[1,2,3]);
  assert.deepEqual(MYTHIC_PHASE_IDENTITY_ATLAS,{src:'./assets/ui/mythic-phase-icons.png',columns:3,rows:2,cellSize:96,width:288,height:192});
  for(const phase of MYTHIC_PHASE_IDENTITY_IDS){const icon=mythicPhaseIdentityIcon(phase);assert.equal(icon.phase,phase);assert.equal(icon.animated,false);assert.equal(icon.motionAmplitude,0);assert.equal(icon.encounterToastIdentitySupported,true);assert.equal(icon.transitionToastIdentitySupported,true);assert.equal(icon.persistentRecallIdentitySupported,true);assert.equal(icon.maxVisibleRecallIcons,1);assert.equal(icon.textFallbackPreserved,true);assert.equal(icon.loadFailureBlocksGameplay,false);}
  assert.equal(mythicPhasePressureSegments(0),1);assert.equal(mythicPhasePressureSegments(.5),2);assert.equal(mythicPhasePressureSegments(1),3);
  const a=auditMythicPhaseIdentityAtlas();assert.equal(a.coverage,1);assert.equal(a.uniqueCellCount,3);assert.deepEqual(a.outOfBounds,[]);assert.equal(a.passed,true);
});
