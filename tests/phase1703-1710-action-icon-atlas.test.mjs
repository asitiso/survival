import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTION_BUTTONS } from '../dist/game/config.js';
import {
  ACTION_ICON_ATLAS,
  actionIconSprite,
  actionIconPresentation,
  auditActionIconAtlas,
} from '../dist/game/action-icon-assets.js';

test('action icon atlas covers all nine combat actions with unique cells', () => {
  const audit = auditActionIconAtlas(ACTION_BUTTONS.map((button) => button.id));
  assert.equal(audit.actionCount, 9);
  assert.equal(audit.coverage, 1);
  assert.equal(audit.uniqueCellCount, 9);
  assert.equal(audit.missing.length, 0);
  assert.equal(ACTION_ICON_ATLAS.columns, 3);
  assert.equal(ACTION_ICON_ATLAS.rows, 3);
});

test('action icon sprite coordinates stay inside the 3x3 atlas', () => {
  for (const button of ACTION_BUTTONS) {
    const sprite = actionIconSprite(button.id);
    assert.equal(sprite.sw, ACTION_ICON_ATLAS.cellSize);
    assert.equal(sprite.sh, ACTION_ICON_ATLAS.cellSize);
    assert.ok(sprite.sx >= 0 && sprite.sy >= 0);
    assert.ok(sprite.sx + sprite.sw <= ACTION_ICON_ATLAS.width);
    assert.ok(sprite.sy + sprite.sh <= ACTION_ICON_ATLAS.height);
  }
});

test('action icon presentation is static and preserves label room for every button radius', () => {
  for (const button of ACTION_BUTTONS) {
    const presentation = actionIconPresentation(button.radius, true);
    assert.equal(presentation.visible, true);
    assert.equal(presentation.animated, false);
    assert.equal(presentation.motionAmplitude, 0);
    assert.ok(presentation.iconSize <= button.radius * 0.86);
    assert.ok(presentation.labelOffsetY > 0);
    assert.ok(presentation.secondaryOffsetY > presentation.labelOffsetY);
    assert.ok(presentation.iconOffsetY < 0);
  }
});

test('action icon presentation fails closed to text-only while the atlas is unavailable', () => {
  const presentation = actionIconPresentation(58, false);
  assert.equal(presentation.visible, false);
  assert.equal(presentation.animated, false);
  assert.equal(presentation.motionAmplitude, 0);
  assert.equal(presentation.labelOffsetY, -4);
  assert.equal(presentation.secondaryOffsetY, 17);
});
