import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const mod=await import('../dist/game/visual-presence.js').catch(()=>({}));

test('phase 1063-1064 source-aware impact recoil points away from the attacker',()=>{
  assert.equal(typeof mod.directionalImpactRecoilProfile,'function');
  const p=mod.directionalImpactRecoilProfile({x:0,y:100},{x:100,y:100},'heavy','high');
  assert.ok(p.offset.x>0); assert.ok(Math.abs(p.offset.y)<.001); assert.equal(p.range,'mid');
});

test('phase 1065-1066 critical far hits read stronger but stay camera-safe',()=>{
  const heavy=mod.directionalImpactRecoilProfile({x:0,y:0},{x:220,y:0},'heavy','high');
  const critical=mod.directionalImpactRecoilProfile({x:0,y:0},{x:220,y:0},'critical','high');
  assert.ok(critical.magnitude>heavy.magnitude);
  for(const q of ['high','medium','low']) for(const tier of ['normal','heavy','critical']){
    const p=mod.directionalImpactRecoilProfile({x:0,y:0},{x:400,y:0},tier,q);
    assert.ok(p.magnitude<=3); assert.ok(p.duration<=.16); assert.ok(Math.abs(p.offset.x)<=3); assert.ok(Math.abs(p.offset.y)<=3);
  }
});

test('phase 1067 low quality sheds recoil decoration without losing direction',()=>{
  const hi=mod.directionalImpactRecoilProfile({x:0,y:0},{x:200,y:0},'critical','high');
  const lo=mod.directionalImpactRecoilProfile({x:0,y:0},{x:200,y:0},'critical','low');
  assert.ok(lo.magnitude<hi.magnitude); assert.ok(lo.offset.x>0);
});

test('phase 1068-1070 CombatFeedback consumes bounded directional recoil',()=>{
  const source=fs.readFileSync(new URL('../src/game/combat-feedback.ts',import.meta.url),'utf8');
  assert.match(source,/directionalImpactRecoilProfile/);
  assert.match(source,/directionalRecoil/);
  assert.match(source,/cameraOffset/);
});
