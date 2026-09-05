import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const main=fs.readFileSync(new URL('../src/main.ts',import.meta.url),'utf8');
const snapshot=fs.readFileSync(new URL('../src/domain/run-snapshot.ts',import.meta.url),'utf8');

const block=(source,start,end)=>{const a=source.indexOf(start);const b=source.indexOf(end,a+start.length);return a>=0?source.slice(a,b>=0?b:undefined):'';};

test('phase 1127 game exposes one transient decision reset that invalidates guard and rebinds current choices',()=>{
  const reset=block(game,'resetTransientDecisionInput(): void','setVisibilityPaused');
  assert.match(reset,/input\.resetTransient\(\)/);
  assert.match(reset,/decisionPickGuard\.resetTransient/);
  assert.match(reset,/decisionReplay/);
  assert.match(reset,/decisionPickGuard\.render/);
});

test('phase 1128 lifecycle handlers use decision reset instead of raw input reset',()=>{
  for(const event of ['pageshow','resize','orientationchange']){
    const handler=main.match(new RegExp(`addEventListener\\('${event}'[\\s\\S]*?\\}\\);`))?.[0]??'';
    assert.match(handler,/resetTransientDecisionInput/);
    assert.doesNotMatch(handler,/game\.input\.resetTransient/);
  }
  const checkpoint=block(game,'checkpointForLifecycle(): void','resetTransientDecisionInput(): void');
  assert.match(checkpoint,/resetTransientDecisionInput/);
});

test('phase 1129 active random reward choices are rebound from a transient replay closure rather than regenerated on lifecycle reset',()=>{
  const boss=block(game,'private openNextBossReward','private openNextLevelUp');
  assert.match(boss,/const choices = eightTwelveReward\.choices/);
  assert.match(boss,/decisionReplay/);
  assert.match(boss,/renderDecision/);
  const level=block(game,'private openNextLevelUp','private loadStoredOnboardingState');
  assert.match(level,/decisionReplay/);
});

test('phase 1130-1134 decision continuity remains transient and RunSnapshot schema has no decision session fields',()=>{
  assert.doesNotMatch(snapshot,/decisionSession|decisionGeneration|decisionReplay|pickGuard/i);
  const flow=block(game,'private continueDecisionSession','private finishDecisionPick');
  assert.match(flow,/this\.decisionReplay = null/);
  assert.match(game,/private decisionReplay:/);
});
