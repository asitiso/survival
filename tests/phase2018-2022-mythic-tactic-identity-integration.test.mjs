import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { mythicTacticReward } from '../dist/game/endless/mythic-tactic-reward.js';
import { createMythicTacticAttackLink, activeMythicTacticAttackLink, consumeMythicTacticAttackLink } from '../dist/game/endless/mythic-tactic-attack-link.js';

const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const archetypes=['inferno','summoner','juggernaut','abyssWitch','twinMaw','timeEater'];

test('phase 2018-2022 Game loads tactic atlas asynchronously and connects reward primed and consumed identity without replacing text',()=>{
  assert.match(source,/MYTHIC_TACTIC_IDENTITY_ATLAS/);
  assert.match(source,/mythicTacticIdentityIdForArchetype/);
  assert.match(source,/mythicTacticIdentityAtlasImage/);
  assert.match(source,/mythicTacticIdentityAtlasReady/);
  assert.match(source,/initializeMythicTacticIdentityAtlas\(\)/);
  assert.match(source,/image\.decoding\s*=\s*'async'/);
  assert.match(source,/image\.src\s*=\s*MYTHIC_TACTIC_IDENTITY_ATLAS\.src/);
  assert.match(source,/showEventToast\(`\$\{tactic\.label\} · MYTHIC TACTIC`,\s*null,\s*archetype\)/);
  assert.match(source,/showEventToast\(`\$\{feedback\.label\} · TACTIC LINK`,\s*null,\s*archetype\)/);
  assert.match(source,/drawMythicTacticToastIcon\(ctx/);
  assert.match(source,/drawMythicTacticPrimedIcon\(ctx\)/);
  assert.match(source,/this\.enemies\.renderEnemies[\s\S]*this\.drawMythicTacticPrimedIcon\(ctx\)/);
  assert.match(source,/ctx\.fillText\(this\.eventToast, 800, 841\)/);
});

test('phase 2018-2022 reward conditions duration attack multipliers expiry and one-shot consume stay unchanged',()=>{
  assert.equal(mythicTacticReward('inferno',false,.8,'stable'),null);
  assert.equal(mythicTacticReward('inferno',true,.49,'stable'),null);
  assert.equal(mythicTacticReward('inferno',true,.8,'collapsed'),null);
  for(const archetype of archetypes){
    const reward=mythicTacticReward(archetype,true,.75,'stable');
    assert.ok(reward); assert.equal(reward.durationMs,5500); assert.equal(reward.bossDamageTakenMultiplier,1.07975); assert.equal(reward.signatureChargeBonus,2.25); assert.equal(reward.flowRetentionMs,1175);
    const link=createMythicTacticAttackLink(archetype,1000,5000);
    assert.equal(link.expiresAtMs,6000); assert.equal(link.consumed,false);
    assert.equal(activeMythicTacticAttackLink(link,5999,archetype)?.archetype,archetype);
    assert.equal(activeMythicTacticAttackLink(link,6001,archetype),null);
    assert.equal(activeMythicTacticAttackLink(consumeMythicTacticAttackLink(link),1200,archetype),null);
  }
});
