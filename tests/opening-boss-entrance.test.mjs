import test from 'node:test';
import assert from 'node:assert/strict';
import { openingBossEntrance } from '../dist/game/opening-boss-entrance.js';

test('opening boss entrance stages anticipation arrival and release without changing schedule',()=>{
  const anticipation=openingBossEntrance(528);
  const arrival=openingBossEntrance(538);
  const release=openingBossEntrance(546);
  assert.equal(anticipation.stage,'anticipation');
  assert.equal(arrival.stage,'arrival');
  assert.equal(release.stage,'release');
  assert.ok(arrival.telegraphRadius>anticipation.telegraphRadius);
  assert.ok(arrival.vignetteAlpha>=anticipation.vignetteAlpha);
  assert.equal(arrival.soundKind,'bossSpawn');
});

test('boss entrance is brief, deterministic, and fully neutral by ten minutes',()=>{
  assert.equal(openingBossEntrance(520).stage,null);
  assert.equal(openingBossEntrance(555).stage,null);
  assert.deepEqual(openingBossEntrance(600),openingBossEntrance(900));
  assert.equal(openingBossEntrance(900).stage,null);
  assert.equal(openingBossEntrance(900).telegraphRadius,0);
});
