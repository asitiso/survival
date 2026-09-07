import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const identity = await import('../dist/game/elite-affix-identity-assets.js');

const approach = { phase: 'approach', active: false, transitionTtl: 0 };
const strike = { phase: 'strike', active: true, transitionTtl: 0.08 };

test('phase 4527 dense Swift routine decoration yields first under battlefield stress', () => {
  assert.equal(typeof identity.swiftCadenceDensityPresentation, 'function');
  const routine = identity.swiftCadenceDensityPresentation(approach, {
    activeCount: 7,
    indexFromPriority: 6,
    priorityTarget: false,
    higherPriorityCue: false,
    battlefieldStress: 0.9,
    reducedMotion: false,
    reducedFlash: false,
  });
  assert.equal(routine.visible, false);
  assert.ok(routine.alphaScale <= 0.2);
});

test('phase 4528 core-near, recently-hit, and active strike ownership survive density pressure', () => {
  const coreNear = identity.swiftCadenceDensityPresentation(approach, {activeCount:8,indexFromPriority:7,priorityTarget:true,higherPriorityCue:false,battlefieldStress:1,reducedMotion:false,reducedFlash:false});
  const striking = identity.swiftCadenceDensityPresentation(strike, {activeCount:8,indexFromPriority:7,priorityTarget:false,higherPriorityCue:false,battlefieldStress:1,reducedMotion:false,reducedFlash:false});
  assert.equal(coreNear.visible, true);
  assert.ok(coreNear.alphaScale >= 0.6);
  assert.equal(striking.visible, true);
  assert.ok(striking.alphaScale >= 0.6);
});

test('phase 4529 higher-priority combat cues suppress routine Swift and only retain a restrained strike trace', () => {
  const routine = identity.swiftCadenceDensityPresentation(approach, {activeCount:3,indexFromPriority:0,priorityTarget:false,higherPriorityCue:true,battlefieldStress:0.4,reducedMotion:false,reducedFlash:false});
  const striking = identity.swiftCadenceDensityPresentation(strike, {activeCount:3,indexFromPriority:2,priorityTarget:true,higherPriorityCue:true,battlefieldStress:0.4,reducedMotion:false,reducedFlash:false});
  assert.equal(routine.visible, false);
  assert.equal(striking.visible, true);
  assert.ok(striking.alphaScale < 0.5);
});

test('phase 4530 Reduced Motion and Reduced Flash stay within accessibility budgets', () => {
  const full = identity.swiftCadenceDensityPresentation(strike, {activeCount:2,indexFromPriority:0,priorityTarget:true,higherPriorityCue:false,battlefieldStress:0.3,reducedMotion:false,reducedFlash:false});
  const motion = identity.swiftCadenceDensityPresentation(strike, {activeCount:2,indexFromPriority:0,priorityTarget:true,higherPriorityCue:false,battlefieldStress:0.3,reducedMotion:true,reducedFlash:false});
  const flash = identity.swiftCadenceDensityPresentation(strike, {activeCount:2,indexFromPriority:0,priorityTarget:true,higherPriorityCue:false,battlefieldStress:0.3,reducedMotion:false,reducedFlash:true});
  assert.equal(motion.motionScale, 0);
  assert.ok(flash.alphaScale < full.alphaScale);
});

test('phase 4531 enemy rendering uses Swift density ranking and preserves urgent ownership', async () => {
  const source = await readFile(new URL('../src/game/enemies.ts', import.meta.url), 'utf8');
  assert.match(source, /swiftCadenceDensityPresentation/);
  assert.match(source, /activeSwift/);
  assert.match(source, /swiftPriorityRank/);
  assert.match(source, /enemy\.target==='core'\|\|targetDistance<=120\|\|enemy\.hitFlash>0\|\|enemy\.swiftCadencePresentation\?\.phase==='strike'/);
});
