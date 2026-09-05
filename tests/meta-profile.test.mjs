import test from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultMetaProfile,
  loadMetaProfile,
  saveMetaProfile,
  metaUpgradeCost,
  purchaseMetaUpgrade,
  metaBonuses,
} from '../dist/domain/meta-profile.js';

function fakeStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, String(value)); },
    snapshot() { return Object.fromEntries(data); },
  };
}

test('meta profile migrates legacy shard balance when versioned profile is absent', () => {
  const storage = fakeStorage({ 'arcane-last-stand.shards': '137' });
  const profile = loadMetaProfile(storage);
  assert.equal(profile.version, 1);
  assert.equal(profile.shards, 137);
  assert.deepEqual(profile.upgrades, { vitality: 0, power: 0, bankroll: 0, magnet: 0 });
});

test('meta profile sanitizes malformed persisted values and respects upgrade caps', () => {
  const storage = fakeStorage({
    'arcane-last-stand.meta-profile': JSON.stringify({
      version: 1,
      shards: -99,
      upgrades: { vitality: 900, power: -3, bankroll: 2.8, magnet: 999 },
    }),
  });
  const profile = loadMetaProfile(storage);
  assert.equal(profile.shards, 0);
  assert.deepEqual(profile.upgrades, { vitality: 5, power: 0, bankroll: 2, magnet: 4 });
});

test('meta upgrade costs rise by target level and capped tracks cannot be purchased again', () => {
  assert.deepEqual([0, 1, 2, 3, 4].map((level) => metaUpgradeCost('vitality', level)), [15, 25, 40, 60, 85]);
  assert.equal(metaUpgradeCost('magnet', 4), null);
  assert.equal(metaUpgradeCost('vitality', 5), null);
});

test('meta purchase spends shards and increments only the selected upgrade', () => {
  const start = { ...defaultMetaProfile(), shards: 100 };
  const out = purchaseMetaUpgrade(start, 'power');
  assert.equal(out.ok, true);
  assert.equal(out.profile.shards, 85);
  assert.equal(out.profile.upgrades.power, 1);
  assert.equal(out.profile.upgrades.vitality, 0);
});

test('meta purchase rejects insufficient shards without mutating the profile', () => {
  const start = { ...defaultMetaProfile(), shards: 5 };
  const out = purchaseMetaUpgrade(start, 'bankroll');
  assert.equal(out.ok, false);
  assert.deepEqual(out.profile, start);
});

test('meta bonuses are bounded and directly useful at run start', () => {
  const profile = {
    version: 1,
    shards: 0,
    upgrades: { vitality: 5, power: 5, bankroll: 5, magnet: 4 },
  };
  assert.deepEqual(metaBonuses(profile), {
    maxHpMultiplier: 1.15,
    spellPowerMultiplier: 1.10,
    startingGold: 250,
    pickupRadiusMultiplier: 1.32,
  });
});

test('saving a meta profile writes the versioned profile key', () => {
  const storage = fakeStorage();
  const profile = { ...defaultMetaProfile(), shards: 42, upgrades: { vitality: 1, power: 2, bankroll: 3, magnet: 4 } };
  saveMetaProfile(storage, profile);
  const raw = storage.snapshot()['arcane-last-stand.meta-profile'];
  assert.ok(raw);
  assert.deepEqual(JSON.parse(raw), profile);
});
