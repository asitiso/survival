import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clearRunSnapshot,
  loadRunSnapshot,
  saveRunSnapshot,
  sanitizeRunSnapshot,
} from '../dist/domain/run-snapshot.js';

function memoryStorage() {
  const map = new Map();
  return {
    getItem(key) { return map.has(key) ? map.get(key) : null; },
    setItem(key, value) { map.set(key, String(value)); },
    removeItem(key) { map.delete(key); },
    raw() { return map; },
  };
}

function validSnapshot() {
  return {
    version: 1,
    savedAt: 123456,
    heroId: 'seria',
    traitId: 'glacialFocus',
    threatLevel: 3,
    elapsed: 844,
    hero: { level: 28, xp: 340, xpNext: 900, hp: 170, maxHp: 260, coins: 740, kills: 1460 },
    coreHp: 620,
    spellLevels: { fireBolt: 10, chainLightning: 8, frostNova: 10, flameField: 7, meteorStorm: 3, blackHole: 2 },
    equipment: { coins: 740, weapon: null, armor: null, healingPotions: 2 },
    relic: 'winter-heart',
    fusions: ['frostfire-cataclysm', 'thunder-singularity'],
    fateChoices: ['guardian', 'frenzy'],
    map: { id: 'frozenFen', evolutionStage: 1 },
    progression: { bossesKilled: 4, goldEarned: 2100, shopTokens: 1 },
  };
}

test('run snapshot round-trips through bounded versioned storage', () => {
  const storage = memoryStorage();
  const snapshot = validSnapshot();
  saveRunSnapshot(storage, snapshot);
  assert.deepEqual(loadRunSnapshot(storage), snapshot);
  clearRunSnapshot(storage);
  assert.equal(loadRunSnapshot(storage), null);
});

test('snapshot sanitizer rejects invalid identities and clamps bounded progress', () => {
  assert.equal(sanitizeRunSnapshot({ ...validSnapshot(), heroId: 'hacker' }), null);
  const safe = sanitizeRunSnapshot({
    ...validSnapshot(),
    threatLevel: 99,
    elapsed: 999999,
    fusions: ['solar-detonation', 'storm-crucible', 'cataclysmic-domain'],
    fateChoices: ['frenzy', 'golden', 'guardian', 'frenzy'],
  });
  assert.equal(safe.threatLevel, 5);
  assert.ok(safe.elapsed <= 7 * 24 * 3600);
  assert.equal(safe.fusions.length, 2);
  assert.equal(safe.fateChoices.length, 3);
});

test('snapshot remains compact and never serializes enemy or projectile swarms', () => {
  const json = JSON.stringify(validSnapshot());
  assert.ok(json.length < 6000);
  assert.equal(json.includes('enemies'), false);
  assert.equal(json.includes('projectiles'), false);
});
