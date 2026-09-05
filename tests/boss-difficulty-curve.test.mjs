import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { bossDifficultyCurve, auditBossDifficultyCurve } from '../dist/game/boss-difficulty-curve.js';

test('phase 307 first three bosses ease smoothly toward neutral',()=>{
  const bosses=[0,1,2].map((ordinal)=>bossDifficultyCurve(ordinal,ordinal*120+120,0));
  assert.ok(bosses[0].healthMultiplier < bosses[1].healthMultiplier);
  assert.ok(bosses[1].healthMultiplier < bosses[2].healthMultiplier);
  assert.ok(bosses[0].damageMultiplier < bosses[1].damageMultiplier);
  assert.ok(bosses[1].damageMultiplier < bosses[2].damageMultiplier);
  assert.ok(bosses[0].initialSpecialTimerMultiplier > bosses[1].initialSpecialTimerMultiplier);
  assert.ok(bosses[1].initialSpecialTimerMultiplier > bosses[2].initialSpecialTimerMultiplier);
  assert.ok(bosses.every((p)=>p.rewardMultiplier>=1&&p.rewardMultiplier<=1.05));
});

test('phase 308 boss four and later are neutral and threat five never creates extra difficulty',()=>{
  assert.deepEqual(bossDifficultyCurve(3,480,0),{healthMultiplier:1,damageMultiplier:1,rewardMultiplier:1,initialSpecialTimerMultiplier:1});
  const t5=bossDifficultyCurve(0,120,5);
  assert.ok(t5.healthMultiplier<=1);
  assert.ok(t5.damageMultiplier<=1);
  assert.ok(t5.initialSpecialTimerMultiplier>=1);
  assert.ok(t5.rewardMultiplier>=1);
});

test('phase 309 boss curve audit is monotonic bounded and late-neutral',()=>{
  const audit=auditBossDifficultyCurve();
  assert.equal(audit.monotonic,true);
  assert.equal(audit.bounded,true);
  assert.equal(audit.lateNeutral,true);
  assert.equal(audit.passed,true);
});

test('phase 310 enemy manager applies curve before mythic/apex post processing and game supplies it',()=>{
  const enemies=fs.readFileSync(new URL('../src/game/enemies.ts',import.meta.url),'utf8');
  const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(enemies,/bossCurve\?:/);
  assert.match(enemies,/ctx\.bossCurve\?\./);
  assert.match(enemies,/boss\.maxHp = Math\.round\(boss\.maxHp \* curve\.healthMultiplier\)/);
  assert.match(enemies,/boss\.specialTimer = \(boss\.specialTimer \?\? 1\) \* curve\.initialSpecialTimerMultiplier/);
  assert.match(game,/bossCurve: bossDifficultyCurve/);
});
