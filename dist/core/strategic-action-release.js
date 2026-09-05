import { ACTION_HOLD_LEASH_SCALE, actionHoldReleaseRadius, shouldReleaseActionHold } from './action-hold-leash.js';
export function strategicActionReleaseRadius(buttonRadius, touchScale) {
    return actionHoldReleaseRadius(buttonRadius, touchScale, ACTION_HOLD_LEASH_SCALE);
}
export class StrategicActionReleaseTracker {
    pointers = new Map();
    owners = new Map();
    arm(pointerId, action, center, releaseRadius) {
        if (this.owners.has(action))
            return false;
        this.pointers.set(pointerId, { action, center: { ...center }, releaseRadius });
        this.owners.set(action, pointerId);
        return true;
    }
    move(pointerId, point) {
        const current = this.pointers.get(pointerId);
        if (!current || !shouldReleaseActionHold(point, current.center, current.releaseRadius))
            return null;
        this.remove(pointerId, current.action);
        return current.action;
    }
    commit(pointerId) {
        const current = this.pointers.get(pointerId);
        if (!current)
            return null;
        this.remove(pointerId, current.action);
        return current.action;
    }
    cancel(pointerId) {
        const current = this.pointers.get(pointerId);
        if (!current)
            return null;
        this.remove(pointerId, current.action);
        return current.action;
    }
    has(pointerId) {
        return this.pointers.has(pointerId);
    }
    clear() {
        this.pointers.clear();
        this.owners.clear();
    }
    remove(pointerId, action) {
        this.pointers.delete(pointerId);
        if (this.owners.get(action) === pointerId)
            this.owners.delete(action);
    }
}
