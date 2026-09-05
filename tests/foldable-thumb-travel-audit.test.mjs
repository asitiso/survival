import test from 'node:test';
import assert from 'node:assert/strict';
import { foldableThumbTravelAudit } from '../dist/game/foldable-thumb-travel-audit.js';
import { landscapeSafeAreaProfile } from '../dist/game/landscape-safe-area.js';
import { ACTION_BUTTONS } from '../dist/game/config.js';

const foldable=landscapeSafeAreaProfile(2208,1840);
const standard=landscapeSafeAreaProfile(1600,900);

test('foldable thumb travel audit keeps all nine actions inside a bounded right-thumb reach',()=>{
  const audit=foldableThumbTravelAudit(foldable,ACTION_BUTTONS);
  assert.equal(audit.applicable,true);
  assert.equal(audit.ok,true);
  assert.equal(audit.reachableActionCount,9);
  assert.deepEqual(audit.unreachableActions,[]);
  assert.ok(audit.maxRightTravel<=560);
  assert.ok(audit.averageRightTravel<=360);
});

test('foldable thumb travel audit never requires an action path through the hinge',()=>{
  const audit=foldableThumbTravelAudit(foldable,ACTION_BUTTONS);
  assert.deepEqual(audit.crossHingeActions,[]);
  assert.equal(audit.hingeClear,true);
  assert.ok(audit.rightAnchor.x>foldable.hingeExclusion.x+foldable.hingeExclusion.width);
});

test('left thumb travel stays bounded inside the joystick ownership area',()=>{
  const audit=foldableThumbTravelAudit(foldable,ACTION_BUTTONS);
  assert.ok(audit.maxLeftTravel<=370);
  assert.ok(audit.leftAnchor.x<foldable.hingeExclusion.x);
  assert.ok(audit.leftAnchor.y>=foldable.joystickMinY&&audit.leftAnchor.y<=foldable.joystickMaxY);
});

test('non-foldable screens report a strict not-applicable pass',()=>{
  const audit=foldableThumbTravelAudit(standard,ACTION_BUTTONS);
  assert.equal(audit.applicable,false);
  assert.equal(audit.ok,true);
  assert.equal(audit.signature,'FT-NA');
});
