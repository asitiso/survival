import test from 'node:test'; import assert from 'node:assert/strict';
import { BOSS_RESPONSE_ACK_IDENTITY_ATLAS,BOSS_RESPONSE_ACK_IDENTITY_IDS,bossResponseAckIdentityIcon,auditBossResponseAckIdentityAtlas } from '../dist/game/boss-response-ack-identity-assets.js';

test('phase 2143 provides six static boss response acknowledgement identities without claiming dodge success',()=>{
  assert.equal(BOSS_RESPONSE_ACK_IDENTITY_IDS.length,6);
  assert.deepEqual(BOSS_RESPONSE_ACK_IDENTITY_ATLAS,{src:'./assets/ui/boss-response-ack-icons.png',columns:3,rows:2,cellSize:96,width:288,height:192});
  for(const id of BOSS_RESPONSE_ACK_IDENTITY_IDS){
    const icon=bossResponseAckIdentityIcon(id);
    assert.equal(icon.animated,false); assert.equal(icon.motionAmplitude,0);
    assert.equal(icon.acknowledgementOnly,true); assert.equal(icon.successClaimed,false);
    assert.equal(icon.responseWindowSeconds,.4); assert.equal(icon.textFallbackPreserved,true);
    assert.equal(icon.loadFailureBlocksGameplay,false);
  }
  const audit=auditBossResponseAckIdentityAtlas();
  assert.equal(audit.coverage,1); assert.equal(audit.uniqueCellCount,6); assert.equal(audit.passed,true);
});
