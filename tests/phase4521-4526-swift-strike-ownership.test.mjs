import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const identity = await import('../dist/game/elite-affix-identity-assets.js');

test('phase 4521 only an actual swift strike owns the source-to-target burst cue', () => {
  assert.equal(typeof identity.swiftStrikeOwnershipPresentation, 'function');
  const actual = identity.swiftStrikeOwnershipPresentation({
    actualStrike: true,
    targetKind: 'core',
    distanceToTarget: 72,
    recentlyHit: false,
    battlefieldStress: 0.7,
    reducedMotion: false,
    reducedFlash: false,
  });
  const routine = identity.swiftStrikeOwnershipPresentation({
    actualStrike: false,
    targetKind: 'hero',
    distanceToTarget: 72,
    recentlyHit: false,
    battlefieldStress: 0.1,
    reducedMotion: false,
    reducedFlash: false,
  });
  assert.equal(actual.visible, true);
  assert.ok(actual.connectorAlpha > 0.3);
  assert.ok(actual.chevronScale > 0);
  assert.equal(routine.visible, false);
  assert.equal(routine.connectorAlpha, 0);
});

test('phase 4522 strike ownership preserves core-near urgency and accessibility budgets', () => {
  const base = identity.swiftStrikeOwnershipPresentation({actualStrike:true,targetKind:'core',distanceToTarget:64,recentlyHit:false,battlefieldStress:0.8,reducedMotion:false,reducedFlash:false});
  const motion = identity.swiftStrikeOwnershipPresentation({actualStrike:true,targetKind:'core',distanceToTarget:64,recentlyHit:false,battlefieldStress:0.8,reducedMotion:true,reducedFlash:false});
  const flash = identity.swiftStrikeOwnershipPresentation({actualStrike:true,targetKind:'core',distanceToTarget:64,recentlyHit:false,battlefieldStress:0.8,reducedMotion:false,reducedFlash:true});
  assert.ok(base.priorityScale >= 0.9);
  assert.equal(motion.motionScale, 0);
  assert.ok(flash.connectorAlpha < base.connectorAlpha);
});

test('phase 4523 enemy update tags swift cadence and queues the actual strike toward its target', async () => {
  const source = await readFile(new URL('../src/game/enemies.ts', import.meta.url), 'utf8');
  assert.match(source, /advanceSwiftCadenceLifecycle/);
  assert.match(source, /queueEliteAffixResponseVfx\(enemy,'swift',targetObj\.pos\)/);
  assert.match(source, /enemy\.attackTimer = enemy\.attackInterval;/);
});
