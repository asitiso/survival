import test from 'node:test';
import assert from 'node:assert/strict';
import { landscapeSafeAreaProfile } from '../dist/game/landscape-safe-area.js';
import { shouldStartLandscapeJoystick, safeJoystickOrigin } from '../dist/game/landscape-hud.js';

test('unfolded near-square landscape reserves a center hinge exclusion shared by HUD and input',()=>{
  const p=landscapeSafeAreaProfile(2208,1840);
  assert.equal(p.aspectClass,'foldable');
  assert.ok(p.hingeExclusion);
  assert.ok(p.hingeExclusion.x>700&&p.hingeExclusion.x<850);
  assert.ok(p.heroPanel.x+p.heroPanel.width<=p.hingeExclusion.x);
  assert.ok(p.statusPanel.x>=p.hingeExclusion.x+p.hingeExclusion.width);
  const hingePoint={x:p.hingeExclusion.x+p.hingeExclusion.width/2,y:500};
  assert.equal(shouldStartLandscapeJoystick(hingePoint,p),false);
  const origin=safeJoystickOrigin({x:900,y:700},p);
  assert.ok(origin.x<=p.joystickMaxX);
});

test('32:9 extreme wide reserves more gesture edge than ordinary 20:9 without hiding required status',()=>{
  const p=landscapeSafeAreaProfile(3840,1080);
  assert.equal(p.aspectClass,'extreme');
  assert.ok(p.leftInset>=90&&p.rightInset>=90);
  assert.ok(p.statusMaxChars>=44);
  assert.ok(p.joystickMaxX<=650);
});

test('existing 16:9 20:9 and 4:3 classifications remain stable',()=>{
  assert.equal(landscapeSafeAreaProfile(1600,900).aspectClass,'standard');
  assert.equal(landscapeSafeAreaProfile(2400,1080).aspectClass,'ultrawide');
  assert.equal(landscapeSafeAreaProfile(1200,900).aspectClass,'compact');
});
