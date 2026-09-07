import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const identity = await import('../dist/game/elite-affix-identity-assets.js');

test('phase 4545 primary owner survives high battlefield stress', () => {
  const visual = identity.eliteAffixDensePresentation({role:'primary',indexFromPriority:9,battlefieldStress:1,coreNear:false,recentlyHit:false,currentlyAttacking:false,higherPriorityCue:false,reducedMotion:false,reducedFlash:false});
  assert.equal(visual.visible, true);
  assert.ok(visual.alphaScale >= 0.5);
});

test('phase 4546 distant passive secondary decoration yields first under dense combat', () => {
  const visual = identity.eliteAffixDensePresentation({role:'secondary',indexFromPriority:5,battlefieldStress:1,coreNear:false,recentlyHit:false,currentlyAttacking:false,higherPriorityCue:false,reducedMotion:false,reducedFlash:false});
  assert.equal(visual.visible, false);
  assert.equal(visual.alphaScale, 0);
});

test('phase 4547 core-near recent-hit or currently-attacking secondary cues remain eligible', () => {
  for (const key of ['coreNear','recentlyHit','currentlyAttacking']) {
    const input = {role:'secondary',indexFromPriority:8,battlefieldStress:1,coreNear:false,recentlyHit:false,currentlyAttacking:false,higherPriorityCue:false,reducedMotion:false,reducedFlash:false,[key]:true};
    const visual = identity.eliteAffixDensePresentation(input);
    assert.equal(visual.visible, true, key);
    assert.ok(visual.alphaScale > 0, key);
  }
});

test('phase 4548 resolved higher-priority battlefield cue suppresses routine secondary extras first', () => {
  const routine = identity.eliteAffixDensePresentation({role:'secondary',indexFromPriority:0,battlefieldStress:0.2,coreNear:false,recentlyHit:false,currentlyAttacking:false,higherPriorityCue:true,reducedMotion:false,reducedFlash:false});
  const primary = identity.eliteAffixDensePresentation({role:'primary',indexFromPriority:0,battlefieldStress:0.2,coreNear:false,recentlyHit:false,currentlyAttacking:false,higherPriorityCue:true,reducedMotion:false,reducedFlash:false});
  assert.equal(routine.visible, false);
  assert.equal(primary.visible, true);
  assert.ok(primary.alphaScale < 0.5);
});

test('phase 4549 dense presentation respects Reduced Motion and Reduced Flash', () => {
  const base = identity.eliteAffixDensePresentation({role:'primary',indexFromPriority:0,battlefieldStress:0.7,coreNear:true,recentlyHit:false,currentlyAttacking:false,higherPriorityCue:false,reducedMotion:false,reducedFlash:false});
  const motion = identity.eliteAffixDensePresentation({role:'primary',indexFromPriority:0,battlefieldStress:0.7,coreNear:true,recentlyHit:false,currentlyAttacking:false,higherPriorityCue:false,reducedMotion:true,reducedFlash:false});
  const flash = identity.eliteAffixDensePresentation({role:'primary',indexFromPriority:0,battlefieldStress:0.7,coreNear:true,recentlyHit:false,currentlyAttacking:false,higherPriorityCue:false,reducedMotion:false,reducedFlash:true});
  assert.equal(motion.motionScale, 0);
  assert.ok(flash.alphaScale < base.alphaScale);
});

test('phase 4550 runtime tracks multi-affix owner while base identity icons stay independent', async () => {
  const source = await readFile(new URL('../src/game/enemies.ts', import.meta.url), 'utf8');
  assert.match(source, /eliteAffixPresentationOwner\?:/);
  assert.match(source, /advanceEliteAffixPresentationOwner/);
  assert.match(source, /eliteAffixDensePresentation/);
  assert.match(source, /for \(let index = 0; index < enemy\.eliteAffixes\.length && index < 2; index \+= 1\)/);
});
