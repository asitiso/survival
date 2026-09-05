import test from 'node:test';
import assert from 'node:assert/strict';
import { landscapeSafeAreaProfile } from '../dist/game/landscape-safe-area.js';

test('16:9 keeps the existing logical layout nearly unchanged',()=>{
  const p=landscapeSafeAreaProfile(1600,900);
  assert.equal(p.aspectClass,'standard');
  assert.ok(p.leftInset<=24&&p.rightInset<=24);
  assert.ok(p.statusMaxChars>=60);
});

test('20:9 reserves side gesture/cutout space and narrows the status line',()=>{
  const p=landscapeSafeAreaProfile(2400,1080);
  assert.equal(p.aspectClass,'ultrawide');
  assert.ok(p.leftInset>=48&&p.rightInset>=48);
  assert.ok(p.statusMaxChars<64);
  assert.ok(p.joystickMaxX<720);
});

test('4:3 reserves additional vertical HUD room without shrinking combat width excessively',()=>{
  const p=landscapeSafeAreaProfile(1200,900);
  assert.equal(p.aspectClass,'compact');
  assert.ok(p.topInset>=24);
  assert.ok(p.joystickMinY>=420);
});
