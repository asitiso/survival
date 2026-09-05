import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultPresentationSettings, loadPresentationSettings, savePresentationSettings } from '../dist/game/presentation-settings.js';

function withThrowingLocalStorage(fn) {
  const prior = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('SecurityError'); } });
  try { return fn(); }
  finally {
    if (prior) Object.defineProperty(globalThis, 'localStorage', prior);
    else delete globalThis.localStorage;
  }
}

test('phase 783 presentation settings load survives a throwing localStorage getter', () => {
  withThrowingLocalStorage(() => {
    assert.doesNotThrow(() => loadPresentationSettings());
    assert.equal(loadPresentationSettings().quality, 'high');
  });
});

test('phase 784 presentation settings save survives a throwing localStorage getter', () => {
  withThrowingLocalStorage(() => {
    assert.doesNotThrow(() => savePresentationSettings(defaultPresentationSettings()));
  });
});

test('phase 785 default presentation storage preserves settings in session memory when persistence is unavailable', () => {
  const desired = { quality: 'medium', reducedFlash: true, reducedShake: false, reducedMotion: false, haptics: false };
  savePresentationSettings(desired);
  assert.deepEqual(loadPresentationSettings(), desired);
});
