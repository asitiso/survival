import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceFinalFormMotion, finalFormMobilityProfile, signatureMobilityImpulse } from '../dist/game/endless/final-form-mobility.js';

const forms=['solar-sovereign','phoenix-lord','volcanic-archon','absolute-empress','winter-warden','crystal-oracle','thunder-tyrant','tempest-runner','storm-oracle','radiant-king','oath-guardian','light-pilgrim'];

test('phase 111 all twelve final forms expose bounded mobility profiles',()=>{
  const profiles=forms.map(finalFormMobilityProfile);
  assert.equal(profiles.filter(Boolean).length,12);
  assert.ok(profiles.every((p)=>p.moveSpeedMultiplier>=.98 && p.moveSpeedMultiplier<=1.08));
  assert.ok(profiles.every((p)=>p.response>=6 && p.response<=18));
  assert.ok(profiles.every((p)=>p.signatureImpulse>=0 && p.signatureImpulse<=80));
});

test('phase 112 final forms resolve into at least four distinct movement families',()=>{
  assert.equal(new Set(forms.map((id)=>finalFormMobilityProfile(id).family)).size,4);
  assert.equal(finalFormMobilityProfile('tempest-runner').family,'flow');
  assert.equal(finalFormMobilityProfile('oath-guardian').family,'anchor');
});

test('phase 113 movement response changes feel without changing legacy movement when no final form exists',()=>{
  assert.deepEqual(advanceFinalFormMotion({x:0,y:0},{x:1,y:0},1/60,null),{x:1,y:0});
  const fast=advanceFinalFormMotion({x:0,y:0},{x:1,y:0},1/60,'tempest-runner');
  const glide=advanceFinalFormMotion({x:0,y:0},{x:1,y:0},1/60,'volcanic-archon');
  assert.ok(fast.x>glide.x);
  assert.ok(fast.x<=1 && glide.x<=1);
});

test('phase 114 signature mobility impulse is directional and bounded',()=>{
  const impulse=signatureMobilityImpulse('thunder-tyrant',{x:3,y:4});
  assert.ok(Math.hypot(impulse.x,impulse.y)<=80);
  assert.ok(impulse.x>0 && impulse.y>0);
  assert.deepEqual(signatureMobilityImpulse(null,{x:1,y:0}),{x:0,y:0});
});
