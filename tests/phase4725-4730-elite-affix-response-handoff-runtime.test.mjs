import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const handoff = await import('../dist/game/elite-affix-response-handoff.js').catch(() => null);

function api() {
  assert.ok(handoff, 'elite-affix-response-handoff module must exist');
  return handoff;
}

function state(overrides = {}) {
  return {
    ownerAffixId: 'manaShield',
    ownerImportant: false,
    fromAffixId: 'swift',
    progress: 0.25,
    lastOwnerTtl: 0.34,
    ...overrides,
  };
}

test('phase 4725 outgoing affix retains explicit handoff role while the new owner settles', () => {
  const role = api().eliteAffixResponseCrossAffixHandoffRole(state(), 'swift', false);
  assert.equal(role, 'outgoing');
});

test('phase 4726 the new primary retains explicit incoming role until the handoff completes', () => {
  const role = api().eliteAffixResponseCrossAffixHandoffRole(state(), 'manaShield', true);
  assert.equal(role, 'incoming');
});

test('phase 4727 unrelated secondary responses never inherit stale outgoing ownership', () => {
  const role = api().eliteAffixResponseCrossAffixHandoffRole(state(), 'frenzied', false);
  assert.equal(role, 'none');
});

test('phase 4728 completed handoff clears both incoming and outgoing transient roles', () => {
  const settled = state({ fromAffixId: null, progress: 1 });
  assert.equal(api().eliteAffixResponseCrossAffixHandoffRole(settled, 'manaShield', true), 'none');
  assert.equal(api().eliteAffixResponseCrossAffixHandoffRole(settled, 'swift', false), 'none');
});

test('phase 4729 handoff role resolution remains deterministic when source-enemy ownership is no longer available', () => {
  const snapshot = state({ ownerImportant: true, progress: 0.5 });
  const first = api().eliteAffixResponseCrossAffixHandoffRole(snapshot, 'swift', false);
  const second = api().eliteAffixResponseCrossAffixHandoffRole(snapshot, 'swift', false);
  assert.equal(first, second);
  assert.equal(first, 'outgoing');
});

test('phase 4730 response runtime advances per-enemy handoff state and passes handoff role plus progress into final presentation', async () => {
  const runtimeSource = await readFile(new URL('../src/game/elite-affix-response-lane-runtime.ts', import.meta.url), 'utf8');
  assert.match(runtimeSource, /advanceEliteAffixResponseCrossAffixHandoff/);
  assert.match(runtimeSource, /eliteAffixResponseCrossAffixHandoffRole/);
  assert.match(runtimeSource, /handoffRole/);
  assert.match(runtimeSource, /handoffProgress/);
});
