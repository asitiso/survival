import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeRunSnapshot } from '../dist/domain/run-snapshot.js';
import { createDefaultExtensionState, serializeExtension, restoreExtension } from '../dist/game/endless/snapshot.js';

function base() {
  return {
    version: 1, savedAt: 10, heroId: 'arkan', traitId: 'destruction', threatLevel: 3, elapsed: 1800,
    hero: { level: 40, xp: 9000, xpNext: 10000, hp: 500, maxHp: 600, coins: 1200, kills: 500 },
    coreHp: 800,
    spellLevels: { fireBolt: 10, chainLightning: 10, frostNova: 10, flameField: 10, meteorStorm: 5, blackHole: 5 },
    equipment: { coins: 1200, weapon: null, armor: null, healingPotions: 2 },
    relic: 'abyss-eye', fusions: ['fireStorm'], fateChoices: ['frenzy'], map: { id: 'ruinedGate', evolutionStage: 2 },
    progression: { bossesKilled: 6, goldEarned: 5000, shopTokens: 2 },
  };
}

test('run snapshot embeds compact endless state without changing legacy snapshot shape when absent', () => {
  const legacy = sanitizeRunSnapshot(base());
  assert.ok(legacy);
  assert.equal(Object.hasOwn(legacy, 'endless'), false);

  const extension = createDefaultExtensionState(1234);
  extension.ascension.tier = 5;
  extension.telemetry.spellCasts = 88;
  const safe = sanitizeRunSnapshot({ ...base(), endless: serializeExtension(extension) });
  assert.ok(safe?.endless);
  assert.deepEqual(restoreExtension(safe.endless), extension);
  assert.equal(safe.endless.includes('enemyPositions'), false);
  assert.equal(safe.endless.includes('projectiles'), false);
});

test('corrupt endless payload is tolerated and restored to safe defaults instead of invalidating resume', () => {
  const safe = sanitizeRunSnapshot({ ...base(), endless: '{bad-json' });
  assert.ok(safe);
  assert.ok(safe.endless);
  const restored = restoreExtension(safe.endless, 99);
  assert.equal(restored.schemaVersion, 2);
  assert.equal(restored.ascension.tier, 0);
  assert.equal(restored.contracts.completedCount, 0);
});
