import type { Vec2 } from './math.js';
import { ACTION_HOLD_LEASH_SCALE, actionHoldReleaseRadius, shouldReleaseActionHold } from './action-hold-leash.js';

export type StrategicActionId = 'shop' | 'auto';

export function strategicActionReleaseRadius(buttonRadius: number, touchScale: number): number {
  return actionHoldReleaseRadius(buttonRadius, touchScale, ACTION_HOLD_LEASH_SCALE);
}

export class StrategicActionReleaseTracker {
  private readonly pointers = new Map<number, { action: StrategicActionId; center: Vec2; releaseRadius: number }>();
  private readonly owners = new Map<StrategicActionId, number>();

  arm(pointerId: number, action: StrategicActionId, center: Vec2, releaseRadius: number): boolean {
    if (this.owners.has(action)) return false;
    this.pointers.set(pointerId, { action, center: { ...center }, releaseRadius });
    this.owners.set(action, pointerId);
    return true;
  }

  move(pointerId: number, point: Vec2): StrategicActionId | null {
    const current = this.pointers.get(pointerId);
    if (!current || !shouldReleaseActionHold(point, current.center, current.releaseRadius)) return null;
    this.remove(pointerId, current.action);
    return current.action;
  }

  commit(pointerId: number): StrategicActionId | null {
    const current = this.pointers.get(pointerId);
    if (!current) return null;
    this.remove(pointerId, current.action);
    return current.action;
  }

  cancel(pointerId: number): StrategicActionId | null {
    const current = this.pointers.get(pointerId);
    if (!current) return null;
    this.remove(pointerId, current.action);
    return current.action;
  }

  has(pointerId: number): boolean {
    return this.pointers.has(pointerId);
  }

  clear(): void {
    this.pointers.clear();
    this.owners.clear();
  }

  private remove(pointerId: number, action: StrategicActionId): void {
    this.pointers.delete(pointerId);
    if (this.owners.get(action) === pointerId) this.owners.delete(action);
  }
}
