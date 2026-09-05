import { clampMagnitude, type Vec2 } from './math.js';
import { ACTION_BUTTONS, ACTION_TOUCH_SCALE, type ActionButtonLayout, type ActionId } from '../game/config.js';

export function hitTestActionButton(
  point: Vec2,
  buttons: readonly ActionButtonLayout[] = ACTION_BUTTONS,
  touchScale = ACTION_TOUCH_SCALE,
  perActionScale?: Partial<Record<ActionId, number>>,
): ActionButtonLayout | null {
  let best: ActionButtonLayout | null = null;
  let bestNormalizedDistance = Number.POSITIVE_INFINITY;
  const scale = Math.max(.5, Math.min(2, Number.isFinite(touchScale) ? touchScale : 1));
  for (const button of buttons) {
    const buttonScale = perActionScale?.[button.id] ?? scale;
    const hitRadius = Math.max(1, button.radius * Math.max(.5,Math.min(2,Number.isFinite(buttonScale)?buttonScale:scale)));
    const normalized = Math.hypot(point.x - button.x, point.y - button.y) / hitRadius;
    if (normalized > 1 || normalized >= bestNormalizedDistance) continue;
    best = button;
    bestNormalizedDistance = normalized;
  }
  return best;
}

export function applyJoystickDeadzone(input: Vec2, deadzone = .12): Vec2 {
  const clamped = clampMagnitude(input, 1);
  const magnitude = Math.hypot(clamped.x, clamped.y);
  const zone = Math.max(0, Math.min(.4, Number.isFinite(deadzone) ? deadzone : .12));
  if (magnitude <= zone || magnitude <= Number.EPSILON) return { x:0, y:0 };
  const remapped = Math.min(1, (magnitude - zone) / Math.max(.0001, 1 - zone));
  return { x:(clamped.x / magnitude) * remapped, y:(clamped.y / magnitude) * remapped };
}
