import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('phase 1383 Game tracks transient boss response acknowledgement separately from cue memory',()=>{
  assert.match(source,/bossResponseAckAction/);
  assert.match(source,/bossResponseAckSince/);
  assert.match(source,/bossResponseAckBossId/);
  assert.match(source,/bossResponseAckArchetype/);
});

test('phase 1391 only manual successful response casts acknowledge boss assist',()=>{
  assert.match(source,/handleSuccessfulCast\(action,\s*autoTriggered\s*\?\s*['"]auto['"]\s*:\s*['"]manual['"]\)/);
  assert.match(source,/handleSuccessfulCast\(action,\s*['"]manual['"]\)/);
  assert.match(source,/recordBossResponseAcknowledgement\([^)]*source/);
  assert.match(source,/source\s*!==\s*['"]manual['"]\)\s*return/);
});

test('phase 1399 Game passes queued cast intents into boss assist and acknowledgement into cue policy',()=>{
  assert.match(source,/queuedActions[^=]*=.*castIntentBuffer\.isQueued/s);
  assert.match(source,/bossActionAssist\(\{[^}]*acknowledged[^}]*queuedActions/s);
});

test('phase 1407 acknowledgement survives an acknowledged null cue but clears when combat window exits',()=>{
  assert.match(source,/clearBossResponseAcknowledgement\(\)/);
  assert.match(source,/clearBufferedCastIntents\(\)[\s\S]*clearBossResponseAcknowledgement\(\)/);
  const drawStart=source.indexOf('actionAssist=bossActionAssist');
  const drawEnd=source.indexOf('const prepAssist=',drawStart);
  const drawBlock=source.slice(drawStart,drawEnd);
  assert.match(drawBlock,/\}else this\.clearBossActionAssistCue\(\);\s*\}else \{ this\.clearBossActionAssistCue\(\); this\.clearBossResponseAcknowledgement\(\); \}/);
});
