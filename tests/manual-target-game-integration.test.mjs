import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const block=(start,end)=>{const a=game.indexOf(start);const b=game.indexOf(end,a+start.length);return a>=0?game.slice(a,b>=0?b:undefined):'';};

test('phase 1207-1210 Game shares one transient manual target memory across pressed buffered and held manual casts',()=>{
  assert.match(game,/ManualTargetMemory/);
  assert.match(game,/manualTargetMemory\s*=\s*new ManualTargetMemory/);
  const prepare=block('private prepareManualTarget','private handleManualCastPress');
  assert.match(prepare,/manualTargetMemory\.select/);
  assert.match(prepare,/preferredManualTargetId/);
  const pressed=block('private handleManualCastPress','private flushBufferedManualCasts');
  const buffered=block('private flushBufferedManualCasts','private handleSuccessfulCast');
  assert.match(pressed,/prepareManualTarget\(spellWorld\)/);
  assert.match(buffered,/prepareManualTarget\(spellWorld\)/);
  const update=block('private update(dt: number)','private updateLongRunRewardRate');
  assert.match(update,/!autoTriggered[\s\S]*prepareManualTarget\(spellWorld\)/);
});

test('phase 1211-1214 manual target memory stays transient and AUTO transitions clear stale manual intent',()=>{
  const update=block('private update(dt: number)','private updateLongRunRewardRate');
  const autoToggle=update.match(/if \(this\.input\.consumePressed\('auto'\)\) \{[\s\S]*?\n    \}/)?.[0]??'';
  assert.match(autoToggle,/manualTargetMemory\.clear\(\)/);
  const clear=block('private clearBufferedCastIntents','resetTransientDecisionInput(): void');
  assert.match(clear,/manualTargetMemory\.clear\(\)/);
  const snapshot=fs.readFileSync(new URL('../src/domain/run-snapshot.ts',import.meta.url),'utf8');
  assert.doesNotMatch(snapshot,/manualTarget|targetMemory|preferredManualTarget/i);
});
