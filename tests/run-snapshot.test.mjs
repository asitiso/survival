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
    equipment: { coins: 740, weapon: null, armor: null, healingPotions: 2, inventory: [], discoveredRecipes: [] },
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
  const snapshot = validSnapshot();
  snapshot.equipment.inventory = [
    { id: 'arcane-staff', kind: 'weapon', name: '마력 지팡이', rank: 1, power: .20, legendary: false, count: 1 },
    { id: 'rapid-wand', kind: 'weapon', name: '속사 완드', rank: 2, power: .09, legendary: false, count: 2 },
    { id: 'blast-rod', kind: 'weapon', name: '폭발 지팡이', rank: 3, power: .12, legendary: false, count: 3 },
    { id: 'iron-robe', kind: 'armor', name: '철갑 로브', rank: 4, power: .10, legendary: false, count: 4 },
    { id: 'sage-amulet', kind: 'accessory', name: '현자의 부적', rank: 5, power: .08, legendary: true, count: 5 },
    { id: 'fate-core', kind: 'accessory', name: '운명의 핵', rank: 6, power: .22, legendary: true, count: 6 },
  ];
  snapshot.equipment.discoveredRecipes = ['celestial-fusion-staff', 'world-tree-armor', 'fate-core'];
  const json = JSON.stringify(snapshot);
  assert.ok(Buffer.byteLength(json, 'utf8') < 6000);
  assert.equal(json.includes('enemies'), false);
  assert.equal(json.includes('projectiles'), false);
});

test('old snapshot gains empty inventory and discovery arrays', () => {
  const legacy = validSnapshot();
  delete legacy.equipment.inventory;
  delete legacy.equipment.discoveredRecipes;
  const restored = sanitizeRunSnapshot(legacy);
  assert.deepEqual(restored.equipment.inventory, []);
  assert.deepEqual(restored.equipment.discoveredRecipes, []);
});

test('snapshot merges valid stacks, drops unknown items, clamps counts, and keeps six stack keys', () => {
  const snapshot = validSnapshot();
  snapshot.equipment.inventory = [
    { id: 'arcane-staff', kind: 'weapon', name: 'first', rank: 1, power: .20, legendary: false, count: 60 },
    { id: 'arcane-staff', kind: 'weapon', name: 'second', rank: 1, power: .20, legendary: false, count: 60 },
    { id: 'bad-id', kind: 'weapon', name: 'bad', rank: 1, power: 1, legendary: false, count: 1 },
    { id: 'fortune-charm', kind: 'weapon', name: 'wrong kind', rank: 1, power: .10, legendary: false, count: 1 },
    { id: 'rapid-wand', kind: 'weapon', name: 'rapid', rank: 0, power: .09, legendary: false, count: 0 },
    { id: 'blast-rod', kind: 'weapon', name: 'blast', rank: 2, power: .12, legendary: false, count: 2 },
    { id: 'iron-robe', kind: 'armor', name: 'iron', rank: 3, power: .10, legendary: false, count: 3 },
    { id: 'gale-cloak', kind: 'armor', name: 'gale', rank: 4, power: .10, legendary: false, count: 4 },
    { id: 'sage-amulet', kind: 'accessory', name: 'sage', rank: 5, power: .08, legendary: true, count: 5 },
    { id: 'storm-ring', kind: 'accessory', name: 'storm', rank: 6, power: .04, legendary: true, count: 6 },
  ];
  snapshot.equipment.discoveredRecipes = ['celestial-fusion-staff', 'bad-id', 'celestial-fusion-staff'];
  const restored = sanitizeRunSnapshot(snapshot);
  assert.equal(restored.equipment.inventory.length, 6);
  assert.equal(restored.equipment.inventory.every((stack) => stack.count >= 1), true);
  assert.deepEqual(restored.equipment.inventory.map((stack) => `${stack.id}@${stack.rank}`), [
    'arcane-staff@1', 'rapid-wand@1', 'blast-rod@2', 'iron-robe@3', 'gale-cloak@4', 'sage-amulet@5',
  ]);
  assert.equal(restored.equipment.inventory[0].count, 99);
  assert.equal(restored.equipment.inventory.some((stack) => stack.id === 'bad-id'), false);
  assert.equal(restored.equipment.inventory.some((stack) => stack.id === 'fortune-charm'), false);
  assert.deepEqual(restored.equipment.discoveredRecipes, ['celestial-fusion-staff']);
});

test('post-legendary equipment survives save and resume', () => {
  const storage = memoryStorage();
  const snapshot = validSnapshot();
  snapshot.equipment.weapon = { id: 'arcane-staff', kind: 'weapon', name: '대마도사의 심장', rank: 12, power: .15, legendary: true };
  saveRunSnapshot(storage, snapshot);
  assert.deepEqual(loadRunSnapshot(storage).equipment.weapon, snapshot.equipment.weapon);
});

test('new accessory snapshots round-trip and old snapshots remain valid', () => {
  const snapshot = validSnapshot();
  snapshot.equipment.accessory = {
    id: 'storm-ring',
    kind: 'accessory',
    name: '천둥군주의 인장',
    rank: 7,
    power: .04,
    legendary: true,
  };
  const storage = memoryStorage();
  saveRunSnapshot(storage, snapshot);
  assert.deepEqual(loadRunSnapshot(storage).equipment.accessory, snapshot.equipment.accessory);

  const legacy = validSnapshot();
  assert.equal(sanitizeRunSnapshot(legacy).equipment.accessory, undefined);

  const invalid = {
    ...snapshot,
    equipment: {
      ...snapshot.equipment,
      accessory: { ...snapshot.equipment.accessory, kind: 'weapon' },
    },
  };
  assert.equal(sanitizeRunSnapshot(invalid).equipment.accessory, null);
});
