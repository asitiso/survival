import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceFinalFormSignature,
  createDefaultFinalFormSignatureState,
  finalFormSignatureModifiers,
  finalFormSignatureProfile,
} from '../dist/game/endless/final-form-signature.js';
import { finalFormCatalog } from '../dist/game/endless/final-form.js';
import { createDefaultExtensionState, restoreExtension, serializeExtension } from '../dist/game/endless/snapshot.js';

test('all twelve final forms expose distinct signature identities with bounded timing', () => {
  const forms = ['arkan','seria','kain','edric'].flatMap((hero) => finalFormCatalog(hero));
  const profiles = forms.map((form) => finalFormSignatureProfile(form));
  assert.equal(profiles.length, 12);
  assert.equal(new Set(profiles.map((profile) => profile.name)).size, 12);
  assert.equal(new Set(profiles.map((profile) => profile.color)).size >= 4, true);
  for (const profile of profiles) {
    assert.ok(profile.durationMs >= 7000 && profile.durationMs <= 12000);
    assert.ok(profile.cooldownMs >= 6000 && profile.cooldownMs <= 16000);
    assert.ok(['burst','cycle','domain','fortress'].includes(profile.family));
  }
});

test('signature charges from existing combat events and auto activates without a new action', () => {
  const form = finalFormCatalog('arkan')[0];
  let state = createDefaultFinalFormSignatureState();
  const events = Array.from({ length: 20 }, () => ({ type:'spell_cast', spellId:'fire-bolt', fusion:true }));
  const result = advanceFinalFormSignature(state, form, events, 80 * 60_000);
  state = result.state;
  assert.equal(result.activated, true);
  assert.equal(state.activations, 1);
  assert.ok(state.activeUntilMs > 80 * 60_000);
  assert.ok(state.cooldownUntilMs > state.activeUntilMs);
  assert.ok(state.charge >= 0 && state.charge < 100);
});

test('signature does not reactivate during cooldown and modifiers are capped', () => {
  const form = finalFormCatalog('seria')[1];
  const start = 80 * 60_000;
  let state = advanceFinalFormSignature(createDefaultFinalFormSignatureState(), form, [{ type:'boss_defeated', bossId:'x', durationMs:1, coreDamage:0 }, ...Array.from({length:20},()=>({type:'spell_cast',spellId:'ice',fusion:true}))], start).state;
  const firstActivations = state.activations;
  state = advanceFinalFormSignature(state, form, Array.from({length:40},()=>({type:'spell_cast',spellId:'ice',fusion:true})), start + 1000).state;
  assert.equal(state.activations, firstActivations);
  const mods = finalFormSignatureModifiers(state, form, start + 1000);
  assert.ok(mods.spellPowerMultiplier <= 1.16);
  assert.ok(mods.areaMultiplier <= 1.2);
  assert.ok(mods.cooldownMultiplier >= 0.8);
  assert.ok(mods.heroDamageTakenMultiplier >= 0.74);
  assert.ok(mods.coreDamageTakenMultiplier >= 0.72);
});

test('signature state survives extension snapshot and phase 62 payloads migrate to default', () => {
  const extension = createDefaultExtensionState(123);
  extension.signature = { charge:77, activeUntilMs:9000, cooldownUntilMs:15000, activations:4, formId:'solar-sovereign' };
  const restored = restoreExtension(serializeExtension(extension), 1);
  assert.deepEqual(restored.signature, extension.signature);

  const legacy = structuredClone(extension);
  delete legacy.signature;
  const migrated = restoreExtension(legacy, 1);
  assert.deepEqual(migrated.signature, createDefaultFinalFormSignatureState());
});
