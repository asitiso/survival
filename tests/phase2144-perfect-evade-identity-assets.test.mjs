import test from 'node:test'; import assert from 'node:assert/strict';
import { PERFECT_EVADE_IDENTITY_ATLAS,PERFECT_EVADE_STREAKS,perfectEvadeIdentityIcon,auditPerfectEvadeIdentityAtlas } from '../dist/game/perfect-evade-identity-assets.js';

test('phase 2144 provides five static perfect evade streak identities and reuses final form identity for the x5 finisher',()=>{
  assert.deepEqual(PERFECT_EVADE_STREAKS,[1,2,3,4,5]);
  assert.deepEqual(PERFECT_EVADE_IDENTITY_ATLAS,{src:'./assets/ui/perfect-evade-icons.png',columns:5,rows:1,cellSize:96,width:480,height:96});
  for(const streak of PERFECT_EVADE_STREAKS){
    const icon=perfectEvadeIdentityIcon(streak);
    assert.equal(icon.streak,streak); assert.equal(icon.animated,false); assert.equal(icon.motionAmplitude,0);
    assert.equal(icon.flowIdentitySupported,true); assert.equal(icon.textFallbackPreserved,true);
    assert.equal(icon.loadFailureBlocksGameplay,false);
    assert.equal(icon.finisherReusesFinalFormIdentity,streak===5);
  }
  const audit=auditPerfectEvadeIdentityAtlas();
  assert.equal(audit.coverage,1); assert.equal(audit.uniqueCellCount,5); assert.equal(audit.passed,true);
});
