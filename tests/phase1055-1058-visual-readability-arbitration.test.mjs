import test from 'node:test';
import assert from 'node:assert/strict';
const mod=await import('../dist/game/visual-presence.js').catch(()=>({}));

test('phase 1055 readability budget always preserves telegraph impact and hit direction',()=>{
  assert.equal(typeof mod.visualReadabilityBudget,'function');
  for(const q of ['high','medium','low']) for(const t of ['normal','danger','critical']){
    const p=mod.visualReadabilityBudget(q,t);
    assert.equal(p.telegraphScale,1); assert.equal(p.impactScale,1); assert.equal(p.hitDirectionScale,1);
  }
});

test('phase 1056 danger and critical shed environment before spell echo',()=>{
  const normal=mod.visualReadabilityBudget('high','normal');
  const danger=mod.visualReadabilityBudget('high','danger');
  const critical=mod.visualReadabilityBudget('high','critical');
  assert.ok(danger.environmentReactionScale<normal.environmentReactionScale);
  assert.ok(critical.environmentReactionScale<=danger.environmentReactionScale);
  assert.ok(critical.environmentReactionScale<critical.spellEchoScale);
});

test('phase 1057 boss pressure remains visible but subordinate under critical threat',()=>{
  const p=mod.visualReadabilityBudget('low','critical');
  assert.ok(p.bossPressureScale>=.22&&p.bossPressureScale<1);
  assert.ok(p.bossPressureScale>=p.environmentReactionScale);
});

test('phase 1058 all decorative arbitration scales remain bounded and nonzero',()=>{
  for(const q of ['high','medium','low']) for(const t of ['normal','danger','critical']){
    const p=mod.visualReadabilityBudget(q,t);
    for(const key of ['spellEchoScale','environmentReactionScale','bossPressureScale','screenDecorationScale']) assert.ok(p[key]>=.15&&p[key]<=1);
  }
});
