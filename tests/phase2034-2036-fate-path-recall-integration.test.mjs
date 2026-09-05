import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FATE_CHECKPOINTS, composeFateModifiers } from '../dist/game/fate-paths.js';
import { FateRuntime } from '../dist/game/fate-runtime.js';

const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('phase 2034-2036 Game reuses decision atlas asynchronously for fate toast and max-three HUD recall while keeping text',()=>{
  assert.match(source,/DECISION_PATH_ICON_ATLAS/);
  assert.match(source,/decisionPathIconAtlasImage/);
  assert.match(source,/decisionPathIconAtlasReady/);
  assert.match(source,/initializeDecisionPathIconAtlas\(\)/);
  assert.match(source,/image\.decoding\s*=\s*'async'/);
  assert.match(source,/image\.src\s*=\s*DECISION_PATH_ICON_ATLAS\.src/);
  assert.match(source,/showEventToast\(`운명 선택 · \$\{fateHudSummary\(\[id\]\)\}`[\s\S]*id/);
  assert.match(source,/drawFatePathToastIcon\(ctx\)/);
  assert.match(source,/drawFatePathRecall\(ctx,[^,]+\.fateIds,[^)]+\)/);
  assert.match(source,/slice\(0,3\)/);
  assert.match(source,/title:\s*'운명',[\s\S]*detail:\s*fateHudSummary\(this\.fateRuntime\.choices\)/);
  assert.match(source,/ctx\.fillText\(this\.eventToast, 800, 841\)/);
});

test('phase 2034-2036 fate checkpoints selection order duplicate behavior and modifier numbers remain unchanged',()=>{
  assert.deepEqual([...FATE_CHECKPOINTS],[360,720,1080]);
  const runtime=new FateRuntime();
  assert.equal(runtime.update(359.999),false); assert.equal(runtime.pending,false);
  assert.equal(runtime.update(360),true); assert.equal(runtime.choose('guardian'),true);
  assert.equal(runtime.update(719.999),false); assert.equal(runtime.update(720),true); assert.equal(runtime.choose('frenzy'),true);
  assert.equal(runtime.update(1079.999),false); assert.equal(runtime.update(1080),true); assert.equal(runtime.choose('guardian'),true);
  assert.deepEqual([...runtime.choices],['guardian','frenzy','guardian']);
  assert.equal(runtime.update(99999),false);
  assert.deepEqual(composeFateModifiers(['frenzy']),{spawnPressureMultiplier:1.14,enemySpeedMultiplier:1,eliteIntervalMultiplier:0.9,xpMultiplier:1.18,goldMultiplier:1,shopTokenMultiplier:1,coreDamageTakenMultiplier:1,bossVariantBonus:0.25,objectiveRewardMultiplier:1.08});
  assert.deepEqual(composeFateModifiers(['golden']),{spawnPressureMultiplier:1,enemySpeedMultiplier:1.08,eliteIntervalMultiplier:1,xpMultiplier:1,goldMultiplier:1.22,shopTokenMultiplier:1.18,coreDamageTakenMultiplier:1,bossVariantBonus:0.15,objectiveRewardMultiplier:1.12});
  assert.deepEqual(composeFateModifiers(['guardian']),{spawnPressureMultiplier:1,enemySpeedMultiplier:1,eliteIntervalMultiplier:1,xpMultiplier:0.98,goldMultiplier:0.96,shopTokenMultiplier:1,coreDamageTakenMultiplier:0.82,bossVariantBonus:0,objectiveRewardMultiplier:1.06});
});
