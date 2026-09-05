import test from 'node:test';
import assert from 'node:assert/strict';

const base={combatPrimary:'normal',reducedFlash:false,active:true};

test('phase 1875 objective marker motion belongs to normal combat attention only',async()=>{
  const {objectiveMarkerMotionPolicy}=await import('../dist/game/tactical-status-attention.js');
  const normal=objectiveMarkerMotionPolicy(base);
  assert.equal(normal.animated,true);
  assert.equal(normal.motionAmplitude,0.05);
  for(const combatPrimary of ['hero-critical','core-critical','damage-critical','boss-response','damage-heavy','boss-countdown']){
    const p=objectiveMarkerMotionPolicy({...base,combatPrimary});
    assert.equal(p.animated,false,combatPrimary);
    assert.equal(p.motionAmplitude,0,combatPrimary);
  }
});

test('reduced flash and inactive objective force steady marker',async()=>{
  const {objectiveMarkerMotionPolicy}=await import('../dist/game/tactical-status-attention.js');
  assert.deepEqual(objectiveMarkerMotionPolicy({...base,reducedFlash:true}),{animated:false,motionAmplitude:0});
  assert.deepEqual(objectiveMarkerMotionPolicy({...base,active:false}),{animated:false,motionAmplitude:0});
});
