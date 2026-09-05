import type { Vec2 } from './math.js';

export const ACTION_HOLD_LEASH_SCALE = 1.20;

export function actionHoldReleaseRadius(
  buttonRadius: number,
  touchScale: number,
  leashScale = ACTION_HOLD_LEASH_SCALE,
): number {
  const radius = Number.isFinite(buttonRadius) ? Math.max(1, buttonRadius) : 1;
  const scale = Number.isFinite(touchScale) ? Math.max(.5, Math.min(2, touchScale)) : 1.30;
  const leash = Number.isFinite(leashScale) ? Math.max(1, Math.min(2, leashScale)) : ACTION_HOLD_LEASH_SCALE;
  return radius * scale * leash;
}

export function shouldReleaseActionHold(point: Vec2, center: Vec2, releaseRadius: number): boolean {
  const radius = Number.isFinite(releaseRadius) ? Math.max(1, releaseRadius) : 1;
  return Math.hypot(point.x - center.x, point.y - center.y) > radius;
}

export class ActionHoldLeashTracker<Action extends string = string> {
  private readonly pointers = new Map<number, { action: Action; center: Vec2; releaseRadius: number }>();

  begin(pointerId: number, action: Action, center: Vec2, releaseRadius: number): void {
    this.pointers.set(pointerId, { action, center: { ...center }, releaseRadius });
  }

  move(pointerId: number, point: Vec2): Action | null {
    const current = this.pointers.get(pointerId);
    if (!current) return null;
    if (!shouldReleaseActionHold(point, current.center, current.releaseRadius)) return null;
    this.pointers.delete(pointerId);
    return current.action;
  }

  end(pointerId: number): Action | null {
    const current = this.pointers.get(pointerId);
    if (!current) return null;
    this.pointers.delete(pointerId);
    return current.action;
  }

  has(pointerId: number): boolean {
    return this.pointers.has(pointerId);
  }

  clear(): void {
    this.pointers.clear();
  }
}
