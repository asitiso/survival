import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('phase 1423 Game records the boss cycle with a manual response acknowledgement',()=>{
  assert.match(source,/bossResponseAckCycle\s*:\s*number\s*\|\s*null/);
  assert.match(source,/bossResponseAckCycle\s*=\s*boss\.bossCycle\s*\?\?\s*0/);
  assert.match(source,/clearBossResponseAcknowledgement\(\)[\s\S]*bossResponseAckCycle\s*=\s*null/);
});

test('phase 1431 Game keeps acknowledgement for the same cycle beyond the 0.40 second timer',()=>{
  const drawStart=source.indexOf('const sameAckBoss=');
  const drawEnd=source.indexOf('const queuedActions=',drawStart);
  const block=source.slice(drawStart,drawEnd);
  assert.match(block,/currentBossCycle\s*=\s*boss\.bossCycle\s*\?\?\s*0/);
  assert.match(block,/sameAckCycle\s*=\s*sameAckBoss\s*&&\s*this\.bossResponseAckCycle\s*===\s*currentBossCycle/);
  assert.match(block,/acknowledged\s*=\s*sameAckCycle\s*&&\s*ackAge\s*<=\s*BOSS_RESPONSE_ACK_SECONDS/);
  assert.match(block,/cycleAcknowledged\s*=\s*sameAckCycle/);
  assert.match(block,/bossResponseAckAction\s*&&\s*!sameAckCycle/);
});

test('phase 1439 Game passes cycle acknowledgement into boss assist policy',()=>{
  assert.match(source,/bossActionAssist\(\{[^}]*acknowledged[^}]*cycleAcknowledged[^}]*queuedActions/s);
});
