import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const mod=await import('../dist/game/visual-presence.js').catch(()=>({}));

test('phase 983 directional hit profile differentiates normal heavy critical',()=>{
  assert.equal(typeof mod.directionalHitVfxProfile,'function');
  const n=mod.directionalHitVfxProfile('normal','high'), h=mod.directionalHitVfxProfile('heavy','high'), c=mod.directionalHitVfxProfile('critical','high');
  assert.ok(n.streakCount<h.streakCount&&h.streakCount<c.streakCount);
  assert.ok(n.length<h.length&&h.length<c.length);
});
test('phase 984 directional hit streaks are bounded for readability',()=>{
  for(const q of ['high','medium','low']) for(const tier of ['normal','heavy','critical']){
    const p=mod.directionalHitVfxProfile(tier,q);
    assert.ok(p.streakCount<=6); assert.ok(p.alpha<=.26); assert.ok(p.length<=52); assert.ok(p.ttl<=.28);
  }
});
test('phase 985 low quality reduces directional decoration without removing impact',()=>{
  const hi=mod.directionalHitVfxProfile('critical','high'), lo=mod.directionalHitVfxProfile('critical','low');
  assert.ok(lo.streakCount<hi.streakCount); assert.ok(lo.streakCount>=1); assert.ok(lo.alpha>0);
});
test('phase 986-990 enemy damage preserves attack origin into combat feedback',()=>{
  const enemies=fs.readFileSync(new URL('../src/game/enemies.ts',import.meta.url),'utf8');
  const feedback=fs.readFileSync(new URL('../src/game/combat-feedback.ts',import.meta.url),'utf8');
  assert.match(enemies,/damage\(enemy:\s*Enemy,\s*amount:\s*number,\s*source\??:\s*Vec2/);
  assert.match(enemies,/addHit\(enemy\.pos,\s*amount,\s*impactTier,\s*enemy\.type,\s*source\)/);
  assert.match(feedback,/directionalHitVfxProfile/);
});
