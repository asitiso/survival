import test from 'node:test';
import assert from 'node:assert/strict';
import { finalFormCatalog } from '../dist/game/endless/final-form.js';
import { finalFormFinisherSignature } from '../dist/game/endless/final-form-finisher-signature.js';

const forms=['arkan','seria','kain','edric'].flatMap((hero)=>finalFormCatalog(hero));

test('all twelve final forms receive unique deterministic finisher presentation signatures',()=>{
  const sigs=forms.map((form)=>finalFormFinisherSignature(form.id));
  assert.equal(sigs.length,12);
  assert.equal(new Set(sigs.map((s)=>s.signatureId)).size,12);
  assert.equal(new Set(sigs.map((s)=>s.labelSuffix)).size,12);
  for(const sig of sigs) assert.deepEqual(finalFormFinisherSignature(sig.formId),sig);
});

test('presentation signatures stay inside mobile-safe geometry caps',()=>{
  for(const form of forms){
    const sig=finalFormFinisherSignature(form.id);
    assert.ok(sig.angleOffset>=0&&sig.angleOffset<Math.PI*2);
    assert.ok(sig.particleSides>=3&&sig.particleSides<=8);
    assert.ok(sig.trailSkew>=-.45&&sig.trailSkew<=.45);
    assert.ok(sig.ringScale>=.9&&sig.ringScale<=1.12);
    assert.match(sig.secondaryAccent,/^#[0-9a-f]{6}$/i);
  }
});
