import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const identity = await import('../dist/game/elite-affix-identity-assets.js');

function advance(previous, overrides={}) {
  return identity.advanceSwiftCadenceLifecycle(previous, {
    inAttackRange: false,
    attackTimer: 0.6,
    attackInterval: 1,
    struck: false,
    dt: 0.016,
    ...overrides,
  });
}

test('phase 4515 swift cadence moves approach to ready without changing gameplay timers', () => {
  assert.equal(typeof identity.advanceSwiftCadenceLifecycle, 'function');
  let state = advance(undefined);
  assert.equal(state.phase, 'approach');
  state = advance(state, { inAttackRange: true, attackTimer: 0.14 });
  assert.equal(state.phase, 'ready');
  assert.equal(state.active, true);
});

test('phase 4516 actual swift strike owns a short strike then recovery lifecycle', () => {
  let state = advance(undefined, { inAttackRange: true, attackTimer: 0.1 });
  state = advance(state, { inAttackRange: true, attackTimer: 0, struck: true });
  assert.equal(state.phase, 'strike');
  assert.ok(state.transitionTtl > 0);
  state = advance(state, { inAttackRange: true, attackTimer: 0.7, dt: 0.12 });
  assert.equal(state.phase, 'recovery');
  state = advance(state, { inAttackRange: false, attackTimer: 0.5, dt: 0.2 });
  assert.equal(state.phase, 'approach');
});

test('phase 4517 cadence presentation keeps direction readable while respecting reduced motion and flash', () => {
  assert.equal(typeof identity.swiftCadencePresentation, 'function');
  const strike = advance(undefined, { inAttackRange: true, attackTimer: 0, struck: true });
  const full = identity.swiftCadencePresentation(strike, false, false);
  const reducedMotion = identity.swiftCadencePresentation(strike, true, false);
  const reducedFlash = identity.swiftCadencePresentation(strike, false, true);
  assert.ok(full.alpha > 0.3);
  assert.ok(full.chevronLength > 0);
  assert.equal(reducedMotion.motionScale, 0);
  assert.ok(reducedFlash.alpha < full.alpha);
});

test('phase 4518 preserves swift gameplay multiplier contract', async () => {
  const affixes = await readFile(new URL('../src/game/elite-affixes.ts', import.meta.url), 'utf8');
  assert.match(affixes, /swift'\) \{ out\.speedMultiplier \*= 1\.28; out\.attackIntervalMultiplier \*= 0\.78; \}/);
});
