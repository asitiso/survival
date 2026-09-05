import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const level=fs.readFileSync(new URL('../src/ui/levelup.ts',import.meta.url),'utf8');
const fate=fs.readFileSync(new URL('../src/ui/fate-select.ts',import.meta.url),'utf8');

const block=(start,end)=>{const a=game.indexOf(start);const b=game.indexOf(end,a+start.length);return a>=0?game.slice(a,b>=0?b:undefined):'';};

test('phase 1117 guarded cards keep listeners alive when the 160ms barrier rejects a stale click',()=>{
  const levelListener=level.match(/button\.addEventListener\('click',[\s\S]*?\);/)?.[0]??'';
  const fateListener=fate.match(/button\.addEventListener\('click',[\s\S]*?\);/)?.[0]??'';
  assert.doesNotMatch(levelListener,/once\s*:\s*true/);
  assert.doesNotMatch(fateListener,/once\s*:\s*true/);
});

test('phase 1119 game owns one decision continuation path with the frozen five-level priority inputs',()=>{
  assert.match(game,/DecisionPickGuard/);
  assert.match(game,/nextDecisionKind/);
  const flow=block('private continueDecisionSession','private openPendingHeroAscension');
  assert.match(flow,/fate:\s*this\.fateRuntime\.pending/);
  assert.match(flow,/heroAscension:\s*Boolean\(this\.endlessState\.heroAscension\.pendingOffer\)/);
  assert.match(flow,/runContract:\s*Boolean\(this\.endlessState\.contracts\.pendingOffer\)/);
  assert.match(flow,/bossRewardCount:\s*this\.queuedBossRewards/);
  assert.match(flow,/levelUpCount:\s*this\.queuedLevelUps/);
  assert.match(flow,/nextDecisionKind/);
});

test('phase 1120-1124 queued boss and level decisions do not close-unpause-microtask-reopen',()=>{
  const boss=block('private openNextBossReward','private openNextLevelUp');
  const levelUp=block('private openNextLevelUp','private loadStoredOnboardingState');
  for(const source of [boss,levelUp]){
    assert.doesNotMatch(source,/queueMicrotask/);
    assert.doesNotMatch(source,/this\.paused\s*=\s*false/);
    assert.match(source,/finishDecisionPick/);
  }
});

test('phase 1125 ascension and contract callbacks return to the same guarded continuation',()=>{
  const asc=block('private openPendingHeroAscension','private openPendingEndlessContract');
  const contract=block('private openPendingEndlessContract','private updateEndlessFieldNodes');
  for(const source of [asc,contract]){
    assert.doesNotMatch(source,/this\.paused\s*=\s*false/);
    assert.match(source,/finishDecisionPick/);
  }
  const runtime=block('private updateEndlessRuntime','private applyEndlessEffect');
  assert.doesNotMatch(runtime,/this\.openPendingHeroAscension\(\)/);
  assert.doesNotMatch(runtime,/this\.openPendingEndlessContract\(\)/);
});

test('phase 1126 fate selection is serialized through the same guarded session',()=>{
  const flow=block('private continueDecisionSession','private openPendingHeroAscension');
  assert.match(flow,/fateSelectOverlay\.open/);
  assert.match(flow,/finishDecisionPick/);
  const update=block('private update\(dt: number\)','private updateLongRunRewardRate');
  assert.match(update,/fateRuntime\.update\(this\.elapsed\)/);
  assert.match(update,/continueDecisionSession/);
});
