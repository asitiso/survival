import test from 'node:test';
import assert from 'node:assert/strict';
import { softFollowJoystickBase, thumbComfortProfile } from '../dist/core/thumb-fatigue.js';

test('phase 459 small joystick motion never moves the anchor under the thumb',()=>{
  assert.deepEqual(softFollowJoystickBase({x:180,y:720},{x:220,y:720}),{x:180,y:720});
});

test('phase 460 long drags softly move the anchor so sustained movement needs less thumb extension',()=>{
  const next=softFollowJoystickBase({x:180,y:720},{x:330,y:720});
  assert.ok(next.x>180&&next.x<330); assert.equal(next.y,720);
});

test('phase 461 soft follow keeps effective thumb travel inside the configured comfort radius',()=>{
  const profile=thumbComfortProfile();
  const pointer={x:390,y:690};
  const next=softFollowJoystickBase({x:180,y:720},pointer,profile);
  assert.ok(Math.hypot(pointer.x-next.x,pointer.y-next.y)<=profile.maxReach+1e-6);
});

test('phase 462 comfort profile is bounded and does not change visible action button positions or add an input mode',()=>{
  const profile=thumbComfortProfile();
  assert.ok(profile.softFollowStart<profile.maxReach);
  assert.ok(profile.maxReach<=96);
  assert.deepEqual(Object.keys(profile).sort(),['maxReach','softFollowStart'].sort());
});
