import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const handoff = await import('../dist/game/elite-affix-response-handoff.js').catch(() => null);
const arbitration = await import('../dist/game/elite-affix-response-arbitration.js').catch(() => null);

function handoffApi() {
  assert.ok(handoff, 'elite-affix-response-handoff module must exist');
  return handoff;
}

function arbitrationApi() {
  assert.ok(arbitration, 'elite-affix-response-arbitration module must exist');
  return arbitration;
}

function state(overrides = {}) {
  return {
    ownerAffixId: 'manaShield',
    ownerImportant: false,
    fromAffixId: 'swift',
    progress: 0.5,
    lastOwnerTtl: 0.30,
    ...overrides,
  };
}

function present(progress, hasOutgoing, overrides = {}) {
  return arbitrationApi().eliteAffixResponseCrossAffixPresentation({
    primary: true,
    importantEvent: true,
    primaryImportant: true,
    baseVisible: true,
    baseAlphaScale: 1,
    battlefieldStress: 0.45,
    higherPriorityCue: false,
    reducedFlash: false,
    handoffRole: 'incoming',
    handoffProgress: progress,
    handoffHasOutgoing: hasOutgoing,
    ...overrides,
  });
}

test('phase 4761 reentrant important owner change preserves progress so incoming alpha never restarts at the raw important floor', () => {
  const previous = state({ progress: 0.5 });
  const next = handoffApi().advanceEliteAffixResponseCrossAffixHandoff(previous, 'frenzied', true, 0.42, ['swift', 'manaShield', 'frenzied']);
  assert.ok(next.progress >= 0.5);
  assert.ok(present(next.progress, true).alphaScale > 0.94);
});

test('phase 4762 when the current owner vanished mid-handoff the surviving prior outgoing trace remains paired with the new incoming owner', () => {
  const previous = state({ progress: 0.4 });
  const next = handoffApi().advanceEliteAffixResponseCrossAffixHandoff(previous, 'frenzied', false, 0.32, ['swift', 'frenzied']);
  assert.equal(next.fromAffixId, 'swift');
  assert.equal(handoffApi().eliteAffixResponseCrossAffixOutgoingPresent(next, ['swift', 'frenzied']), true);
});

test('phase 4763 if every prior outgoing cue is gone the reentrant owner uses source-loss recovery instead of a phantom trace', () => {
  const previous = state({ progress: 0.4 });
  const next = handoffApi().advanceEliteAffixResponseCrossAffixHandoff(previous, 'frenzied', false, 0.32, ['frenzied']);
  const hasOutgoing = handoffApi().eliteAffixResponseCrossAffixOutgoingPresent(next, ['frenzied']);
  assert.equal(hasOutgoing, false);
  const result = present(next.progress, hasOutgoing, { importantEvent: false, primaryImportant: false });
  assert.ok(result.alphaScale >= 0.82);
});

test('phase 4764 Reduced Flash remains the final ceiling after reentrant important progress carry', () => {
  const previous = state({ progress: 0.6 });
  const next = handoffApi().advanceEliteAffixResponseCrossAffixHandoff(previous, 'frenzied', true, 0.42, ['manaShield', 'frenzied']);
  const result = present(next.progress, true, { reducedFlash: true });
  assert.ok(result.alphaScale <= 0.72);
});

test('phase 4765 a reentrant handoff exposes exactly one outgoing role and one incoming role', () => {
  const previous = state({ progress: 0.4 });
  const next = handoffApi().advanceEliteAffixResponseCrossAffixHandoff(previous, 'frenzied', true, 0.42, ['swift', 'frenzied']);
  const roles = ['swift', 'manaShield', 'frenzied'].map((affixId) =>
    handoffApi().eliteAffixResponseCrossAffixHandoffRole(next, affixId, affixId === 'frenzied'),
  );
  assert.deepEqual(roles.filter((role) => role === 'outgoing'), ['outgoing']);
  assert.deepEqual(roles.filter((role) => role === 'incoming'), ['incoming']);
});

test('phase 4766 response runtime passes the active affix group into reentrant handoff advancement', async () => {
  const runtimeSource = await readFile(new URL('../src/game/elite-affix-response-lane-runtime.ts', import.meta.url), 'utf8');
  assert.match(runtimeSource, /advanceEliteAffixResponseCrossAffixHandoff\([\s\S]*group\.map\(\(cue\) => cue\.affixId\)/);
});
