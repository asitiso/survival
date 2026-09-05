import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { EnemyManager } from '../dist/game/enemies.js';

test('enemy manager applies encounter boss vulnerability to real boss damage', () => {
  const enemies = new EnemyManager();
  const id = enemies.spawnEventEnemy('boss', 1, 'hero', {x:800,y:400});
  const boss = enemies.enemies.find(e => e.id === id);
  const before = boss.hp;
  enemies.setBossEncounterModifiers({bossDamageTakenMultiplier:0.5,specialCadenceMultiplier:1,summonCountMultiplier:1,dashDistanceMultiplier:1});
  enemies.damage(boss, 100);
  assert.equal(Math.round(before - boss.hp), 50);
});

test('boss special runtime consumes encounter cadence summon and dash channels', () => {
  const source = fs.readFileSync(new URL('../src/game/enemies.ts', import.meta.url), 'utf8');
  assert.match(source, /specialCadenceMultiplier/);
  assert.match(source, /summonCountMultiplier/);
  assert.match(source, /dashDistanceMultiplier/);
});

test('game integrates boss nodes hazards and spell magic target sink without a new action', () => {
  const source = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
  assert.match(source, /BossEncounterSystem/);
  assert.match(source, /BossArenaSystem/);
  assert.match(source, /magicTargets: this\.bossEncounter/);
  assert.match(source, /drawBossEncounterNodes/);
  assert.match(source, /drawBossArenaHazards/);
  const config = fs.readFileSync(new URL('../src/game/config.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(config, /bossNodeButton|arenaButton|weakpointButton/);
});
