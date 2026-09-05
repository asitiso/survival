import test from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultMasteryProfile,
  grantMasteryXp,
  loadMasteryProfile,
  masteryXpNeeded,
  saveMasteryProfile,
} from '../dist/domain/mastery-profile.js';
import { masteryXpForRun } from '../dist/domain/mastery-rewards.js';

function storageWith(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem(key) { return map.has(key) ? map.get(key) : null; },
    setItem(key, value) { map.set(key, String(value)); },
    dump() { return map; },
  };
}

test('mastery profile starts every hero at level 1 with zero xp', () => {
  const profile = defaultMasteryProfile();
  assert.equal(profile.version, 1);
  for (const heroId of ['arkan', 'seria', 'kain', 'edric']) {
    assert.deepEqual(profile.heroes[heroId], { level: 1, xp: 0 });
  }
});

test('mastery loader sanitizes corrupt and out-of-range hero values', () => {
  const storage = storageWith({
    'arcane-last-stand.mastery-profile': JSON.stringify({
      version: 999,
      heroes: {
        arkan: { level: -4, xp: -20 },
        seria: { level: 999, xp: 999999 },
        kain: { level: '7', xp: '42' },
        edric: null,
      },
    }),
  });
  const profile = loadMasteryProfile(storage);
  assert.deepEqual(profile.heroes.arkan, { level: 1, xp: 0 });
  assert.deepEqual(profile.heroes.seria, { level: 20, xp: 0 });
  assert.equal(profile.heroes.kain.level, 7);
  assert.equal(profile.heroes.kain.xp, 42);
  assert.deepEqual(profile.heroes.edric, { level: 1, xp: 0 });
});

test('mastery xp advances only the selected hero and carries overflow', () => {
  const start = defaultMasteryProfile();
  const needed = masteryXpNeeded(1);
  const next = grantMasteryXp(start, 'arkan', needed + 17);
  assert.deepEqual(next.heroes.arkan, { level: 2, xp: 17 });
  assert.deepEqual(next.heroes.seria, { level: 1, xp: 0 });
});

test('mastery level caps at 20 and discards overflow xp', () => {
  const start = defaultMasteryProfile();
  start.heroes.edric = { level: 19, xp: masteryXpNeeded(19) - 1 };
  const next = grantMasteryXp(start, 'edric', 100000);
  assert.deepEqual(next.heroes.edric, { level: 20, xp: 0 });
});

test('mastery profile round-trips through versioned storage', () => {
  const storage = storageWith();
  const profile = grantMasteryXp(defaultMasteryProfile(), 'kain', 155);
  saveMasteryProfile(storage, profile);
  assert.deepEqual(loadMasteryProfile(storage), profile);
});

test('mastery run reward grows with survival bosses and threat but remains bounded', () => {
  const short = masteryXpForRun({ seconds: 180, bosses: 0, threatLevel: 0, kills: 150 });
  const long = masteryXpForRun({ seconds: 1800, bosses: 5, threatLevel: 4, kills: 2500 });
  const extreme = masteryXpForRun({ seconds: 999999, bosses: 999, threatLevel: 5, kills: 999999 });
  assert.ok(short > 0);
  assert.ok(long > short);
  assert.ok(extreme <= 600);
});
