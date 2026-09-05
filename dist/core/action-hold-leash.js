export const ACTION_HOLD_LEASH_SCALE = 1.20;
export function actionHoldReleaseRadius(buttonRadius, touchScale, leashScale = ACTION_HOLD_LEASH_SCALE) {
    const radius = Number.isFinite(buttonRadius) ? Math.max(1, buttonRadius) : 1;
    const scale = Number.isFinite(touchScale) ? Math.max(.5, Math.min(2, touchScale)) : 1.30;
    const leash = Number.isFinite(leashScale) ? Math.max(1, Math.min(2, leashScale)) : ACTION_HOLD_LEASH_SCALE;
    return radius * scale * leash;
}
export function shouldReleaseActionHold(point, center, releaseRadius) {
    const radius = Number.isFinite(releaseRadius) ? Math.max(1, releaseRadius) : 1;
    return Math.hypot(point.x - center.x, point.y - center.y) > radius;
}
export class ActionHoldLeashTracker {
    pointers = new Map();
    begin(pointerId, action, center, releaseRadius) {
        this.pointers.set(pointerId, { action, center: { ...center }, releaseRadius });
    }
    move(pointerId, point) {
        const current = this.pointers.get(pointerId);
        if (!current)
            return null;
        if (!shouldReleaseActionHold(point, current.center, current.releaseRadius))
            return null;
        this.pointers.delete(pointerId);
        return current.action;
    }
    end(pointerId) {
        const current = this.pointers.get(pointerId);
        if (!current)
            return null;
        this.pointers.delete(pointerId);
        return current.action;
    }
    has(pointerId) {
        return this.pointers.has(pointerId);
    }
    clear() {
        this.pointers.clear();
    }
}
