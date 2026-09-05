import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OnboardingController,
  defaultOnboardingState,
  loadOnboardingState,
  saveOnboardingState,
} from '../dist/game/onboarding.js';

function storageWith(raw = null) {
  let value = raw;
  return { getItem() { return value; }, setItem(_k, next) { value = String(next); } };
}

test('onboarding advances only from the expected gameplay signal in six short steps', () => {
  const onboarding = new OnboardingController(defaultOnboardingState());
  assert.equal(onboarding.current?.id, 'move');
  assert.equal(onboarding.signal('spell'), false);
  for (const id of ['move', 'spell', 'ultimate', 'levelup', 'shop', 'core']) {
    assert.equal(onboarding.current?.id, id);
    assert.equal(onboarding.signal(id), true);
  }
  assert.equal(onboarding.done, true);
  assert.equal(onboarding.current, null);
});

test('already completed hints never replay in the same controller', () => {
  const onboarding = new OnboardingController(defaultOnboardingState());
  onboarding.signal('move');
  const index = onboarding.stepIndex;
  assert.equal(onboarding.signal('move'), false);
  assert.equal(onboarding.stepIndex, index);
});

test('onboarding completion persists and corrupt storage falls back safely', () => {
  const storage = storageWith();
  const done = { version: 1, stepIndex: 6, completed: true };
  saveOnboardingState(storage, done);
  assert.deepEqual(loadOnboardingState(storage), done);
  const corrupt = storageWith('{nope');
  assert.deepEqual(loadOnboardingState(corrupt), defaultOnboardingState());
});

test('game hooks onboarding to movement casts levelup shop and guardian pressure signals', async () => {
  const { readFile } = await import('node:fs/promises');
  const source = await readFile(new URL('../src/game/game.ts', import.meta.url), 'utf8');
  for (const token of ["onboarding.signal('move')", "onboarding.signal('spell')", "onboarding.signal('ultimate')", "onboarding.signal('levelup')", "onboarding.signal('shop')", "onboarding.signal('core')"]) {
    assert.ok(source.includes(token), `missing onboarding hook ${token}`);
  }
});
