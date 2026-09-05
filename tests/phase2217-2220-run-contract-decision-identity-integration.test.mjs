import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const host=fs.readFileSync(new URL('../src/game/endless/host.ts',import.meta.url),'utf8');
const overlay=fs.readFileSync(new URL('../src/ui/levelup.ts',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const contracts=fs.readFileSync(new URL('../src/game/endless/contracts.ts',import.meta.url),'utf8');
const snapshot=fs.readFileSync(new URL('../src/game/endless/snapshot.ts',import.meta.url),'utf8');

test('phase 2217 contract choice cards expose optional requirement and boon secondary identities without changing other cards',()=>{
  assert.match(host,/secondaryIdentityStyles/);
  assert.match(host,/runContractRequirementIdentityStyle/);
  assert.match(host,/runContractBoonEffectIdentityStyle/);
  assert.match(overlay,/secondaryIdentityStyles\?:\s*readonly string\[\]/);
  assert.match(overlay,/upgrade-secondary-identities/);
  assert.match(css,/\.upgrade-secondary-identities/);
  assert.match(css,/\.upgrade-secondary-identity/);
});

test('phase 2218-2219 active contract row reuses mission pace atlas and previews one boon effect',()=>{
  assert.match(game,/RUN_MISSION_PACE_IDENTITY_ATLAS/);
  assert.match(game,/RUN_CONTRACT_BOON_EFFECT_IDENTITY_ATLAS/);
  assert.match(game,/initializeRunContractBoonEffectIdentityAtlas/);
  assert.match(game,/runContractPaceId/);
  assert.match(game,/drawRunContractPaceBoonRecall/);
  assert.match(game,/runMissionPaceIdentityForRatios/);
  assert.match(game,/runContractBoonEffectIdentityForFamily/);
});

test('phase 2220 success toast shows boon effect while failure has no boon effect helper',()=>{
  assert.match(game,/eventToastContractBoonFamily/);
  assert.match(game,/showRunContractSuccessToast/);
  assert.match(game,/contract_reward[\s\S]*showRunContractSuccessToast/);
  assert.match(game,/contract_failed[\s\S]*showEventToast/);
  assert.match(game,/drawRunContractBoonEffectToastIcon/);
});

test('phase 2220 hides only new active contract helpers during critical combat attention',()=>{
  assert.match(game,/hideRunContractHelperIdentity/);
  assert.match(game,/heroCritical/);
  assert.match(game,/coreCritical/);
  assert.match(game,/bossSpecialTimer\s*<=\s*1\.2/);
});

test('phase 2217-2220 keeps contract gameplay and snapshot schema frozen',()=>{
  assert.match(contracts,/return \(4 \+ index \* 5\) \* 60_000/);
  assert.match(contracts,/return \(19 \+ \(index - 3\) \* 7\) \* 60_000/);
  assert.match(contracts,/durationMs:\s*45_000/);assert.match(contracts,/durationMs:\s*30_000/);assert.match(contracts,/durationMs:\s*40_000/);assert.match(contracts,/durationMs:\s*60_000/);assert.match(contracts,/durationMs:\s*20_000/);
  assert.match(contracts,/baselineCoreHp \* 0\.2/);assert.match(contracts,/event\.type === 'hero_damaged'/);assert.match(contracts,/completedAtMs \+ 90_000/);
  assert.match(contracts,/xpMultiplier:\s*1\.12,\s*masteryMultiplier:\s*1\.08/);
  assert.match(contracts,/coreDamageTakenMultiplier \*= 0\.88; out\.potionEfficiency \*= 1\.1/);
  assert.match(contracts,/fusionPowerMultiplier \*= 1\.1; out\.cooldownMultiplier \*= 0\.92/);
  assert.match(contracts,/goldMultiplier \*= 1\.15; out\.bossDamageMultiplier \*= 1\.08/);
  assert.match(contracts,/coreDamageTakenMultiplier \*= 0\.92; out\.potionEfficiency \*= 1\.15/);
  assert.doesNotMatch(snapshot,/runContractRequirementIdentity|runContractBoonEffectIdentity|eventToastContractBoonFamily|runContractPaceId/);
});
