import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { mythicBossProfile, mythicPressureModifiers } from '../dist/game/endless/mythic-boss.js';
import { buildRunFingerprint } from '../dist/game/endless/run-fingerprint.js';
import { createDefaultExtensionState, serializeExtension, restoreExtension } from '../dist/game/endless/snapshot.js';
import { simulateBalanceV3 } from '../dist/game/endless/balance-simulator-v3.js';
import { EnemyManager } from '../dist/game/enemies.js';
import { ACTION_BUTTONS } from '../dist/game/config.js';

test('phase 33 mythic boss begins after one hour at high threat and combines exactly three unique existing channels', () => {
  assert.equal(mythicBossProfile(3599, 5, 7).active, false);
  assert.equal(mythicBossProfile(3600, 3, 7).active, false);
  const profile = mythicBossProfile(3600, 5, 7);
  assert.equal(profile.active, true);
  assert.equal(profile.channels.length, 3);
  assert.equal(new Set(profile.channels).size, 3);
  const pressure = mythicPressureModifiers(profile);
  assert.ok(pressure.healthMultiplier <= 1.6);
  assert.ok(pressure.damageMultiplier <= 1.4);
  assert.ok(pressure.projectileDensityMultiplier <= 1.35);
  assert.ok(pressure.summonCountMultiplier <= 1.18);
});

test('phase 34 run fingerprint is stable, compact, and changes when the meaningful final build changes', () => {
  const input = { heroId:'arkan', threat:5, elapsedSeconds:7234, relicId:'phoenix-brand', fusions:['fireStorm','magmaChain'], fateChoices:['frenzy','golden','guardian'], heroAscensions:['wildfire-doctrine','solar-collapse'], chronicle:['forty-five','hour-one','ninety'] };
  const a = buildRunFingerprint(input);
  const b = buildRunFingerprint({ ...input });
  const c = buildRunFingerprint({ ...input, relicId:'abyss-eye' });
  assert.equal(a, b);
  assert.notEqual(a, c);
  assert.match(a, /^ARC-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
});

test('phase 35 endless snapshot checksum rejects silent payload tampering while legacy payloads still migrate', () => {
  const state = createDefaultExtensionState(4321);
  state.ascension.tier = 8;
  const encoded = serializeExtension(state);
  const envelope = JSON.parse(encoded);
  assert.equal(envelope.envelopeVersion, 1);
  assert.equal(typeof envelope.checksum, 'string');
  envelope.payload.ascension.tier = 2;
  const tampered = restoreExtension(JSON.stringify(envelope), 99);
  assert.equal(tampered.ascension.tier, 0);
  const legacy = restoreExtension(JSON.stringify(state), 99);
  assert.equal(legacy.ascension.tier, 8);
});

test('phase 36 enemy scaling applies capped endless health and damage to newly created entities', () => {
  const normal = new EnemyManager();
  const nId = normal.spawnEventEnemy('grunt', 4, 'hero', {x:100,y:100});
  const n = normal.enemies.find((enemy) => enemy.id === nId);
  const scaled = new EnemyManager();
  scaled.setEndlessScaling(1.8, 1.5, 1.25);
  const sId = scaled.spawnEventEnemy('grunt', 4, 'hero', {x:100,y:100});
  const e = scaled.enemies.find((enemy) => enemy.id === sId);
  assert.ok(e.maxHp > n.maxHp);
  assert.ok(e.damage > n.damage);
  assert.ok(e.maxHp <= n.maxHp * 2.01);
  assert.ok(e.damage <= n.damage * 1.71);
});

test('phase 37 balance simulator verifies 120 and 180 minute low-device threat-five guardrails', () => {
  const result = simulateBalanceV3({ threat:5, deviceClass:'low' });
  assert.deepEqual(result.checkpoints.map((x) => x.minute), [10,20,30,45,60,90,120,180]);
  assert.ok(result.checkpoints.every((x) => x.withinPerformanceGuard));
  assert.ok(result.checkpoints.every((x) => x.enemyHealthMultiplier <= 2));
  assert.ok(result.checkpoints.every((x) => x.enemyDamageMultiplier <= 1.7));
  assert.ok(result.checkpoints.find((x) => x.minute === 180).mythicEligible);
  assert.equal(result.ascensionXGuard.withinPerformanceGuard, true);
});

test('product integration keeps nine actions and exposes run code, mythic boss, scaling and checksum paths in Game', () => {
  assert.equal(ACTION_BUTTONS.length, 9);
  const game = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
  const results = fs.readFileSync(new URL('../src/ui/results.ts', import.meta.url), 'utf8');
  assert.match(game, /mythicBossProfile\(/);
  assert.match(game, /setEndlessScaling\(/);
  assert.match(game, /buildRunFingerprint\(/);
  assert.match(results, /runCode/);
});
