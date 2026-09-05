import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTION_BUTTONS } from '../dist/game/config.js';
import { compactLandscapeStatusLine, hudNoTouchRects, isHudNoTouchPoint, safeJoystickOrigin, shouldStartLandscapeJoystick } from '../dist/game/landscape-hud.js';

test('phase 119 landscape status copy keeps critical state while staying bounded',()=>{
  const line=compactLandscapeStatusLine({mapName:'얼어붙은 늪지대 장기 진화',threatLevel:5,threatName:'종말',danger:12,disasterName:'차원 붕괴',kills:123456,coins:987654},62);
  assert.ok(line.length<=62);
  assert.match(line,/T5/);
  assert.match(line,/위험 12/);
  assert.match(line,/얼어붙은/);
});

test('phase 120 landscape HUD declares stable no-touch safety zones without adding actions',()=>{
  assert.equal(ACTION_BUTTONS.length,9);
  const rects=hudNoTouchRects();
  assert.ok(rects.length>=3);
  assert.equal(isHudNoTouchPoint({x:200,y:200}),true);
  assert.equal(isHudNoTouchPoint({x:700,y:600}),false);
});

test('phase 121 joystick origin clamps away from HUD and bottom bezel',()=>{
  const top=safeJoystickOrigin({x:20,y:350});
  const bottom=safeJoystickOrigin({x:790,y:899});
  assert.ok(top.x>=110 && top.y>=400);
  assert.ok(bottom.x<=720 && bottom.y<=770);
  assert.equal(isHudNoTouchPoint(top),false);
  assert.equal(isHudNoTouchPoint(bottom),false);
});

test('phase 122 joystick activation rejects HUD touches but preserves the normal left combat zone',()=>{
  assert.equal(shouldStartLandscapeJoystick({x:250,y:250}),false);
  assert.equal(shouldStartLandscapeJoystick({x:300,y:520}),true);
  assert.equal(shouldStartLandscapeJoystick({x:900,y:520}),false);
});
