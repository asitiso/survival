import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { contractHudLine, createDefaultContractState } from '../dist/game/endless/contracts.js';
import { deepRunDecisionAttention } from '../dist/game/deep-run-decision-attention.js';

test('phase 1948 contract HUD formats count and timed contracts compactly without changing runtime state', () => {
  const base=createDefaultContractState();
  const count={...base,active:{contractId:'c1',family:'slayer',startedAtMs:0,deadlineMs:45000,target:42,progress:18,baselineCoreHp:1000}};
  const timed={...base,active:{contractId:'c2',family:'warden',startedAtMs:0,deadlineMs:30000,target:30000,progress:12600,baselineCoreHp:1000}};
  assert.equal(contractHudLine(count),'CONTRACT · SLAYER 18/42');
  assert.equal(contractHudLine(timed),'CONTRACT · WARDEN 12/30s');
  assert.equal(contractHudLine(base),'');
  assert.equal(count.active.progress,18);
  assert.equal(timed.active.progress,12600);
});

test('phase 1950 deep-run attention keeps progress ahead of routine ascension recall', () => {
  const calm=deepRunDecisionAttention({bossActive:false,mythicActive:false,heroCritical:false,coreCritical:false,activeContract:false,activeOath:false,ascensionCount:3});
  assert.equal(calm.maxAscensionIcons,3);
  assert.equal(calm.showAscensionRecall,true);

  const objective=deepRunDecisionAttention({bossActive:false,mythicActive:false,heroCritical:false,coreCritical:false,activeContract:true,activeOath:true,ascensionCount:3});
  assert.equal(objective.showContractProgress,true);
  assert.equal(objective.showOathProgress,true);
  assert.equal(objective.maxAscensionIcons,2);

  const boss=deepRunDecisionAttention({bossActive:true,mythicActive:false,heroCritical:false,coreCritical:false,activeContract:true,activeOath:false,ascensionCount:3});
  assert.equal(boss.maxAscensionIcons,1);

  const critical=deepRunDecisionAttention({bossActive:true,mythicActive:true,heroCritical:true,coreCritical:false,activeContract:true,activeOath:true,ascensionCount:3});
  assert.equal(critical.maxAscensionIcons,0);
  assert.equal(critical.showAscensionRecall,false);
  assert.equal(critical.preserveCriticalBars,true);
  assert.equal(critical.preserveDangerTelegraphs,true);
});

test('phase 1947-1950 game HUD loads the atlas non-blocking and draws contract/oath/ascension identities', () => {
  const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(source,/initializeDeepRunDecisionIdentityAtlas\(\)/);
  assert.match(source,/image\.decoding = 'async'/);
  assert.match(source,/deepRunDecisionAttention\(/);
  assert.match(source,/contractHudLine\(/);
  assert.match(source,/drawDeepRunDecisionIdentityHud\(/);
  assert.match(source,/kind:'contract'/);
  assert.match(source,/kind:'oath'/);
  assert.match(source,/kind:'ascension'/);
});
