import test from 'node:test';
import assert from 'node:assert/strict';
const mod=await import('../dist/game/visual-presence.js').catch(()=>({}));

test('phase 1015 visual priority always preserves impact and danger telegraphs',()=>{
  assert.equal(typeof mod.visualPriorityPolicy,'function');
  for(const q of ['high','medium','low']) for(const critical of [false,true]){
    const p=mod.visualPriorityPolicy(q,critical);
    assert.equal(p.impactScale,1);assert.equal(p.telegraphScale,1);
  }
});
test('phase 1016 critical threat sheds ambient before residue',()=>{
  const p=mod.visualPriorityPolicy('high',true);
  assert.ok(p.environmentScale<p.spellResidueScale);assert.ok(p.spellResidueScale<1);
});
test('phase 1017 low quality compounds only decorative reductions',()=>{
  const hi=mod.visualPriorityPolicy('high',true),lo=mod.visualPriorityPolicy('low',true);
  assert.ok(lo.environmentScale<hi.environmentScale);assert.ok(lo.spellResidueScale<hi.spellResidueScale);
  assert.equal(lo.impactScale,1);assert.equal(lo.telegraphScale,1);
});
test('phase 1018 priority values remain bounded and nonzero',()=>{
  for(const q of ['high','medium','low']) for(const critical of [false,true]){
    const p=mod.visualPriorityPolicy(q,critical);
    for(const key of ['environmentScale','spellResidueScale','screenDecorationScale']) assert.ok(p[key]>=.15&&p[key]<=1);
  }
});
