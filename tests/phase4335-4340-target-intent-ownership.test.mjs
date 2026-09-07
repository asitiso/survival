import test from 'node:test';
import assert from 'node:assert/strict';

async function cueModule(){
  return import('../dist/game/target-intent-cue.js').catch(()=>({}));
}

test('Phase 4335-4340 exposes committed-target intent presentation without candidate ownership',async()=>{
  const mod=await cueModule();
  assert.equal(typeof mod.targetIntentCuePresentation,'function');
  const cue=mod.targetIntentCuePresentation({mode:'auto',committedTargetId:7,targetAlive:true,targetRadius:24});
  assert.equal(cue.visible,true);
  assert.equal(cue.targetId,7);
  assert.equal(cue.mode,'auto');
});

test('target intent cue disappears when no committed live target exists',async()=>{
  const mod=await cueModule();
  assert.equal(typeof mod.targetIntentCuePresentation,'function');
  assert.equal(mod.targetIntentCuePresentation({mode:'manual',committedTargetId:null,targetAlive:true,targetRadius:24}).visible,false);
  assert.equal(mod.targetIntentCuePresentation({mode:'manual',committedTargetId:3,targetAlive:false,targetRadius:24}).visible,false);
});

test('boss weakpoint direction reuses the existing AUTO 79% and manual 38% assist contracts',async()=>{
  const mod=await cueModule();
  assert.equal(typeof mod.targetIntentCuePresentation,'function');
  const auto=mod.targetIntentCuePresentation({mode:'auto',committedTargetId:1,targetAlive:true,targetRadius:58,weakpointAvailable:true});
  const manual=mod.targetIntentCuePresentation({mode:'manual',committedTargetId:1,targetAlive:true,targetRadius:58,weakpointAvailable:true});
  assert.equal(auto.weakpointBlend,0.79);
  assert.equal(manual.weakpointBlend,0.38);
  assert.equal(auto.showWeakpointDirection,true);
  assert.equal(manual.showWeakpointDirection,true);
});
