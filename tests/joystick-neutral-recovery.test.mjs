import test from 'node:test';
import assert from 'node:assert/strict';
import {
  joystickNeutralRecoveryProfile,
  shouldCatchJoystickNeutralReturn,
} from '../dist/core/joystick-neutral-recovery.js';

test('phase 1263 recovery profile derives its thresholds from the existing 92px max reach',()=>{
  const profile=joystickNeutralRecoveryProfile(92);
  assert.ok(profile.catchRadius>=20&&profile.catchRadius<=24);
  assert.ok(profile.minBaseShift>0&&profile.minBaseShift<profile.catchRadius);
  assert.equal(profile.maxReach,92);
});

test('phase 1271 a thumb returning near its original home catches neutral after soft-follow shifted the base',()=>{
  const profile=joystickNeutralRecoveryProfile(92);
  assert.equal(shouldCatchJoystickNeutralReturn(
    {x:180,y:720},
    {x:308,y:720},
    {x:184,y:716},
    profile,
  ),true);
});

test('phase 1273 neutral catch stays disabled before soft-follow has materially shifted the base',()=>{
  const profile=joystickNeutralRecoveryProfile(92);
  assert.equal(shouldCatchJoystickNeutralReturn(
    {x:180,y:720},
    {x:188,y:720},
    {x:182,y:720},
    profile,
  ),false);
});

test('phase 1276 normal movement far from home never gets swallowed by neutral recovery',()=>{
  const profile=joystickNeutralRecoveryProfile(92);
  assert.equal(shouldCatchJoystickNeutralReturn(
    {x:180,y:720},
    {x:300,y:720},
    {x:420,y:720},
    profile,
  ),false);
});

test('phase 1279 catch radius boundary is deterministic',()=>{
  const profile=joystickNeutralRecoveryProfile(92);
  const base={x:308,y:720};
  const home={x:180,y:720};
  assert.equal(shouldCatchJoystickNeutralReturn(home,base,{x:home.x+profile.catchRadius,y:home.y},profile),true);
  assert.equal(shouldCatchJoystickNeutralReturn(home,base,{x:home.x+profile.catchRadius+.01,y:home.y},profile),false);
});
