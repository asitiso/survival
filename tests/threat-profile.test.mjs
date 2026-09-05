import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultThreatProfile, loadThreatProfile, saveThreatProfile, selectThreatLevel, unlockThreatLevel } from '../dist/domain/threat-profile.js';

function storage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return { getItem: (k) => data.has(k) ? data.get(k) : null, setItem: (k,v) => data.set(k,String(v)), snapshot: () => Object.fromEntries(data) };
}

test('new players start on threat zero only', () => {
  assert.deepEqual(defaultThreatProfile(), { version: 1, unlocked: 0, selected: 0 });
});

test('persisted threat state sanitizes selection above unlocked level', () => {
  const s = storage({ 'arcane-last-stand.threat-profile': JSON.stringify({ version: 1, unlocked: 3, selected: 5 }) });
  assert.deepEqual(loadThreatProfile(s), { version: 1, unlocked: 3, selected: 3 });
});

test('selection can never exceed unlocked threat', () => {
  const p = { version: 1, unlocked: 2, selected: 0 };
  assert.equal(selectThreatLevel(p, 5).selected, 2);
  assert.equal(selectThreatLevel(p, 1).selected, 1);
});

test('unlocking preserves a valid selection and never lowers progress', () => {
  const p = { version: 1, unlocked: 2, selected: 2 };
  assert.equal(unlockThreatLevel(p, 4).unlocked, 4);
  assert.equal(unlockThreatLevel(p, 1).unlocked, 2);
});

test('saving threat profile writes a bounded versioned payload', () => {
  const s = storage();
  saveThreatProfile(s, { version: 1, unlocked: 99, selected: 99 });
  assert.deepEqual(JSON.parse(s.snapshot()['arcane-last-stand.threat-profile']), { version: 1, unlocked: 5, selected: 5 });
});
