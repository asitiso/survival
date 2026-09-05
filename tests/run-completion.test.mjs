import test from 'node:test';
import assert from 'node:assert/strict';
import { completeRunProgression } from '../dist/domain/run-completion.js';
import { defaultRunRecords } from '../dist/domain/run-records.js';
import { defaultThreatProfile } from '../dist/domain/threat-profile.js';

test('qualifying run records a new best and unlocks exactly one next threat tier', () => {
  const out = completeRunProgression(defaultThreatProfile(), defaultRunRecords(), {
    heroId: 'arkan', mapId: 'ruinedGate', threatLevel: 0, seconds: 700, kills: 1000, bosses: 2, danger: 6,
  });
  assert.equal(out.newRecord, true);
  assert.equal(out.threatProfile.unlocked, 1);
  assert.equal(out.unlockedNewThreat, true);
  assert.equal(out.records.recent.length, 1);
});

test('short run can create a record without unlocking a new threat tier', () => {
  const out = completeRunProgression(defaultThreatProfile(), defaultRunRecords(), {
    heroId: 'seria', mapId: 'frozenFen', threatLevel: 0, seconds: 180, kills: 150, bosses: 0, danger: 2,
  });
  assert.equal(out.newRecord, true);
  assert.equal(out.threatProfile.unlocked, 0);
  assert.equal(out.unlockedNewThreat, false);
});

test('lower threat farming cannot unlock a tier above current unlocked challenge', () => {
  const profile = { version: 1, unlocked: 3, selected: 0 };
  const out = completeRunProgression(profile, defaultRunRecords(), {
    heroId: 'kain', mapId: 'crystalQuarry', threatLevel: 0, seconds: 1800, kills: 4000, bosses: 10, danger: 12,
  });
  assert.equal(out.threatProfile.unlocked, 3);
  assert.equal(out.unlockedNewThreat, false);
});
