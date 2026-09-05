import test from 'node:test';
import assert from 'node:assert/strict';
const mod=await import('../dist/game/visual-presence.js').catch(()=>({}));

test('phase 1095 visual focus always preserves gameplay-critical layers',()=>{
  assert.equal(typeof mod.visualFocusBudget,'function');
  for(const q of ['high','medium','low']) for(const threat of ['normal','danger','critical']) for(const boss of ['none','strained','desperate']){
    const p=mod.visualFocusBudget(q,threat,boss);
    assert.equal(p.telegraphScale,1); assert.equal(p.impactScale,1); assert.equal(p.hitDirectionScale,1);
  }
});

test('phase 1096 critical desperate state sheds environment before spell echo and boss pressure',()=>{
  const p=mod.visualFocusBudget('high','critical','desperate');
  assert.ok(p.environmentScale<p.spellEchoScale); assert.ok(p.spellEchoScale<=p.bossPressureScale); assert.ok(p.bossPressureScale>=.25);
});

test('phase 1097 low quality compounds decoration only and keeps screen cap bounded',()=>{
  const hi=mod.visualFocusBudget('high','danger','strained'),lo=mod.visualFocusBudget('low','danger','strained');
  assert.ok(lo.environmentScale<hi.environmentScale); assert.ok(lo.spellEchoScale<hi.spellEchoScale);
  assert.ok(lo.screenEffectCap<=2); assert.equal(lo.telegraphScale,1); assert.equal(lo.impactScale,1);
});

test('phase 1098 all focus scales remain nonzero and bounded',()=>{
  for(const q of ['high','medium','low']) for(const threat of ['normal','danger','critical']) for(const boss of ['none','strained','desperate']){
    const p=mod.visualFocusBudget(q,threat,boss);
    for(const key of ['environmentScale','spellEchoScale','bossPressureScale','screenDecorationScale']) assert.ok(p[key]>=.15&&p[key]<=1);
    assert.ok(p.screenEffectCap>=1&&p.screenEffectCap<=4);
  }
});
