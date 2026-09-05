import test from 'node:test';
import assert from 'node:assert/strict';

import { createDefaultExtensionState, serializeExtension, restoreExtension } from '../dist/game/endless/snapshot.js';
import { advanceEndlessRuntime } from '../dist/game/endless/runtime.js';

function legacy(elapsedMs=0) {
  return { heroId:'arkan', elapsedMs, level:30, threat:5, kills:500, bossesDefeated:5, elitesDefeated:20, gold:1000, xp:10000, guardianCoreHp:900, guardianCoreMaxHp:1000, fate:'frenzy', spellFusionCount:2, mapEvolutionRank:2, masteryLevel:20, deviceClass:'high' };
}

test('phase 45 default extension snapshot includes bounded overdrive state and round trips it', () => {
  const state = createDefaultExtensionState(123);
  assert.deepEqual(state.overdrive, {charge:0, activeUntilMs:0, activations:0});
  const changed = { ...state, overdrive:{charge:77, activeUntilMs:123456, activations:4} };
  assert.deepEqual(restoreExtension(serializeExtension(changed)).overdrive, changed.overdrive);
});

test('legacy extension payload without overdrive migrates to defaults', () => {
  const base = createDefaultExtensionState(22);
  const legacyPayload = structuredClone(base);
  delete legacyPayload.overdrive;
  const restored = restoreExtension(legacyPayload);
  assert.deepEqual(restored.overdrive, {charge:0, activeUntilMs:0, activations:0});
});

test('corrupt overdrive values are sanitized and bounded', () => {
  const base = createDefaultExtensionState(22);
  const restored = restoreExtension({ ...base, overdrive:{charge:999,activeUntilMs:-5,activations:1e20} });
  assert.equal(restored.overdrive.charge, 100);
  assert.equal(restored.overdrive.activeUntilMs, 0);
  assert.ok(restored.overdrive.activations <= Number.MAX_SAFE_INTEGER);
});

test('runtime consumes existing spell events to progress overdrive deterministically', () => {
  const state = createDefaultExtensionState(77);
  const events = Array.from({length:50}, () => ({type:'spell_cast', spellId:'fireBolt'}));
  const out = advanceEndlessRuntime({legacy:legacy(5*60_000),state,deltaMs:16,events});
  assert.equal(out.state.overdrive.activations, 1);
  assert.equal(out.state.overdrive.activeUntilMs, 5*60_000 + 12_000);
});
