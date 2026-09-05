import test from 'node:test';
import assert from 'node:assert/strict';
import { BOSS_ARENA_MUTATION_IDENTITY_IDS,BOSS_ARENA_MUTATION_IDENTITY_ATLAS,bossArenaMutationIdentityIcon,auditBossArenaMutationIdentityAtlas } from '../dist/game/endless/boss-arena-mutation-identity-assets.js';

test('phase 2079 provides five static unique boss arena mutation identities in a 3x2 atlas',()=>{
  assert.deepEqual(BOSS_ARENA_MUTATION_IDENTITY_IDS,['rotating_front','fractured_ring','gravity_well','mirror_lanes','shrinking_sanctum']);
  assert.deepEqual(BOSS_ARENA_MUTATION_IDENTITY_ATLAS,{src:'./assets/ui/boss-arena-mutation-icons.png',columns:3,rows:2,cellSize:96,width:288,height:192});
  const icons=BOSS_ARENA_MUTATION_IDENTITY_IDS.map(bossArenaMutationIdentityIcon);
  assert.equal(new Set(icons.map(v=>`${v.sx}:${v.sy}`)).size,5);
  for(const icon of icons){assert.equal(icon.animated,false);assert.equal(icon.motionAmplitude,0);assert.equal(icon.maxVisibleRecallIcons,1);assert.equal(icon.textFallbackPreserved,true);assert.equal(icon.loadFailureBlocksGameplay,false);}
  const audit=auditBossArenaMutationIdentityAtlas();assert.equal(audit.coverage,1);assert.equal(audit.uniqueCellCount,5);assert.deepEqual(audit.outOfBounds,[]);assert.equal(audit.passed,true);
});
