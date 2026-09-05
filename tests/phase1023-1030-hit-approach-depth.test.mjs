import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const mod=await import('../dist/game/visual-presence.js').catch(()=>({}));

test('phase 1023-1024 hit approach distinguishes melee mid and far source depth',()=>{
  assert.equal(typeof mod.hitApproachProfile,'function');
  const target={x:100,y:100};
  assert.equal(mod.hitApproachProfile({x:112,y:100},target,'heavy','high').range,'melee');
  assert.equal(mod.hitApproachProfile({x:180,y:100},target,'heavy','high').range,'mid');
  assert.equal(mod.hitApproachProfile({x:320,y:100},target,'heavy','high').range,'far');
});

test('phase 1025-1026 far hit approach has stronger directional read but bounded decoration',()=>{
  const target={x:100,y:100};
  const near=mod.hitApproachProfile({x:112,y:100},target,'critical','high');
  const far=mod.hitApproachProfile({x:320,y:100},target,'critical','high');
  assert.ok(far.tailScale>near.tailScale); assert.ok(far.spread>=near.spread);
  for(const q of ['high','medium','low']) for(const tier of ['normal','heavy','critical']){
    const p=mod.hitApproachProfile({x:340,y:100},target,tier,q);
    assert.ok(p.tailScale<=1.18); assert.ok(p.spread<=7); assert.ok(p.alphaScale<=1);
  }
});

test('phase 1027 low quality reduces only approach decoration',()=>{
  const target={x:100,y:100};
  const hi=mod.hitApproachProfile({x:320,y:100},target,'critical','high');
  const lo=mod.hitApproachProfile({x:320,y:100},target,'critical','low');
  assert.ok(lo.alphaScale<hi.alphaScale); assert.ok(lo.alphaScale>0);
});

test('phase 1028-1030 combat feedback consumes hit approach profile without losing hit tier',()=>{
  const source=fs.readFileSync(new URL('../src/game/combat-feedback.ts',import.meta.url),'utf8');
  assert.match(source,/hitApproachProfile/); assert.match(source,/cue\.tier/); assert.match(source,/cue\.source/);
});
