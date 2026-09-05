import test from 'node:test';
import assert from 'node:assert/strict';
import { finalFormAttackPattern, FINAL_FORM_PATTERN_IDS } from '../dist/game/endless/final-form-patterns.js';

const forms=['solar-sovereign','phoenix-lord','volcanic-archon','absolute-empress','winter-warden','crystal-oracle','thunder-tyrant','tempest-runner','storm-oracle','radiant-king','oath-guardian','light-pilgrim'];

test('all twelve final forms map to bounded one-shot attack patterns',()=>{
  assert.equal(FINAL_FORM_PATTERN_IDS.size,12);
  for(const id of forms){
    const p=finalFormAttackPattern(id); assert.ok(p, id);
    assert.equal(p.formId,id);
    assert.ok(p.radius>=120 && p.radius<=380);
    assert.ok(p.damageMultiplier>=.55 && p.damageMultiplier<=1.5);
    assert.ok(p.pushDistance>=0 && p.pushDistance<=130);
    assert.ok(p.coreHealPercent>=0 && p.coreHealPercent<=.04);
    assert.ok(p.chainTargets>=0 && p.chainTargets<=12);
    assert.ok(p.slowFactor>=.35 && p.slowFactor<=1);
    assert.ok(p.slowDuration>=0 && p.slowDuration<=3.5);
  }
  assert.equal(finalFormAttackPattern('not-a-form'),null);
});

test('final forms span four mechanical pulse families instead of color-only variants',()=>{
  const kinds=new Set(forms.map((id)=>finalFormAttackPattern(id).kind));
  assert.deepEqual([...kinds].sort(),['chain','domain','nova','shockwave']);
  assert.equal(finalFormAttackPattern('thunder-tyrant').kind,'chain');
  assert.equal(finalFormAttackPattern('oath-guardian').kind,'shockwave');
  assert.equal(finalFormAttackPattern('absolute-empress').kind,'domain');
  assert.equal(finalFormAttackPattern('solar-sovereign').kind,'nova');
});

test('protective forms trade raw damage for push or core recovery while burst forms hit harder',()=>{
  const guard=finalFormAttackPattern('oath-guardian');
  const burst=finalFormAttackPattern('solar-sovereign');
  assert.ok(guard.coreHealPercent>0);
  assert.ok(guard.pushDistance>0);
  assert.ok(burst.damageMultiplier>guard.damageMultiplier);
});
