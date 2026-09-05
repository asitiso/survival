import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { ascensionMutatorRuntimeModifiers } from '../dist/game/endless/ascension-mutator-runtime.js';
import { mythicCounterplayModifiers } from '../dist/game/endless/mythic-counterplay.js';
import { loadRunSnapshot, saveRunSnapshot, clearRunSnapshot } from '../dist/domain/run-snapshot.js';
import { appendRunHistory, loadRunHistory } from '../dist/domain/run-history.js';
import { auditSixHourSoak } from '../dist/game/endless/soak-auditor.js';

function memoryStorage() {
  const map = new Map();
  return {
    map,
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => map.set(key, value),
    removeItem: (key) => map.delete(key),
  };
}

function snapshot(elapsed) {
  return {
    version: 1, savedAt: elapsed * 1000, heroId:'arkan', traitId:null, threatLevel:5, elapsed,
    hero:{ level:30, xp:10, xpNext:100, hp:500, maxHp:500, coins:100, kills:200 }, coreHp:900,
    spellLevels:{ fireBolt:10, chainLightning:10, frostNova:10, flameField:10, meteorStorm:3, blackHole:3 },
    equipment:{ coins:100, weapon:null, armor:null, healingPotions:1 }, relic:null, fusions:[], fateChoices:[],
    map:{ id:'ruinedGate', evolutionStage:2 }, progression:{ bossesKilled:3, goldEarned:1000, shopTokens:1 },
  };
}

test('phase 38 ascension mutators change only bounded runtime channels', () => {
  const mods = ascensionMutatorRuntimeModifiers(['accelerated_projectiles','reinforced_elites','volatile_death','scarce_shop']);
  assert.ok(mods.projectileSpeedMultiplier > 1 && mods.projectileSpeedMultiplier <= 1.2);
  assert.ok(mods.eliteHealthMultiplier > 1 && mods.eliteHealthMultiplier <= 1.3);
  assert.ok(mods.shopIntervalMultiplier > 1 && mods.shopIntervalMultiplier <= 1.2);
  assert.equal(mods.volatileDeath.enabled, true);
  assert.ok(mods.volatileDeath.radius <= 120);
  assert.ok(mods.volatileDeath.damage <= 75);
});

test('phase 39 mythic counterplay rewards clearing every encounter node without trivializing the boss', () => {
  const neutral = mythicCounterplayModifiers(true, 1, 3);
  assert.deepEqual(neutral, { bossDamageTakenMultiplier:1, specialCadenceMultiplier:1, summonCountMultiplier:1 });
  const broken = mythicCounterplayModifiers(true, 0, 3);
  assert.ok(broken.bossDamageTakenMultiplier > 1 && broken.bossDamageTakenMultiplier <= 1.15);
  assert.ok(broken.specialCadenceMultiplier > 1 && broken.specialCadenceMultiplier <= 1.25);
  assert.ok(broken.summonCountMultiplier < 1 && broken.summonCountMultiplier >= .8);
});

test('phase 40 run snapshot falls back to the previous valid checkpoint if the primary slot is corrupted', () => {
  const storage = memoryStorage();
  saveRunSnapshot(storage, snapshot(60));
  saveRunSnapshot(storage, snapshot(75));
  storage.setItem('arcane-last-stand.run-snapshot', '{broken');
  assert.equal(loadRunSnapshot(storage)?.elapsed, 60);
  clearRunSnapshot(storage);
  assert.equal(loadRunSnapshot(storage), null);
  assert.equal(storage.map.size, 0);
});

test('phase 41 recent run history is bounded to five entries and newest run is first', () => {
  const storage = memoryStorage();
  for (let i=0; i<7; i++) appendRunHistory(storage, { runCode:`ARC-${i}`, heroId:'arkan', seconds:600+i, threat:5, score:1000+i });
  const history = loadRunHistory(storage);
  assert.equal(history.length, 5);
  assert.equal(history[0].runCode, 'ARC-6');
  assert.equal(history[4].runCode, 'ARC-2');
});

test('phase 42 six-hour low-device threat-five soak stays inside hard caps', () => {
  const audit = auditSixHourSoak('low', 5);
  assert.equal(audit.minutes.at(-1), 360);
  assert.equal(audit.ascensionTier, 10);
  assert.ok(audit.maxEnemyBudget <= audit.caps.enemyBudget);
  assert.ok(audit.maxProjectileBudget <= audit.caps.projectileBudget);
  assert.ok(audit.maxEffectBudget <= audit.caps.effectBudget);
  assert.equal(audit.passed, true);
});

test('phase 38-42 product integration keeps nine actions and wires backup/history/counterplay without new combat controls', () => {
  const game = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
  const enemies = fs.readFileSync(new URL('../src/game/enemies.ts', import.meta.url), 'utf8');
  const lobby = fs.readFileSync(new URL('../src/ui/lobby.ts', import.meta.url), 'utf8');
  const input = fs.readFileSync(new URL('../src/game/config.ts', import.meta.url), 'utf8');
  assert.match(game, /ascensionMutatorRuntimeModifiers\(/);
  assert.match(game, /mythicCounterplayModifiers\(/);
  assert.match(game, /appendRunHistory\(/);
  assert.match(enemies, /eliteHealthMultiplier/);
  assert.match(lobby, /recentRuns/);
  const actionMatch = input.match(/export const ACTION_BUTTONS[\s\S]*?as const;/);
  assert.ok(actionMatch);
  assert.equal((actionMatch[0].match(/\{ id:/g) ?? []).length, 9);
});
