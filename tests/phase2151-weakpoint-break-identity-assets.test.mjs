import test from 'node:test'; import assert from 'node:assert/strict';
import { BOSS_WEAKPOINT_BREAK_IDENTITY_ATLAS,BOSS_WEAKPOINT_BREAK_IDENTITY_IDS,bossWeakpointBreakIdentityIcon,auditBossWeakpointBreakIdentityAtlas } from '../dist/game/boss-weakpoint-break-identity-assets.js';

test('phase 2151 provides six static weakpoint break completion identities',()=>{
  assert.equal(BOSS_WEAKPOINT_BREAK_IDENTITY_IDS.length,6);
  assert.deepEqual(BOSS_WEAKPOINT_BREAK_IDENTITY_ATLAS,{src:'./assets/bosses/boss-weakpoint-break-icons.png',columns:3,rows:2,cellSize:96,width:288,height:192});
  for(const id of BOSS_WEAKPOINT_BREAK_IDENTITY_IDS){const icon=bossWeakpointBreakIdentityIcon(id);assert.equal(icon.archetype,id);assert.equal(icon.completionToastIdentitySupported,true);assert.equal(icon.animated,false);assert.equal(icon.motionAmplitude,0);assert.equal(icon.textFallbackPreserved,true);assert.equal(icon.loadFailureBlocksGameplay,false);}
  const audit=auditBossWeakpointBreakIdentityAtlas(); assert.equal(audit.coverage,1); assert.equal(audit.uniqueCellCount,6); assert.deepEqual(audit.outOfBounds,[]); assert.equal(audit.passed,true);
});
