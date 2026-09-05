import { clamp } from '../core/math.js';
import { ACTION_TOUCH_SCALE } from './config.js';
export function foldableTouchScaleMap(safe, buttons, baseScale = ACTION_TOUCH_SCALE) {
    const boundedBase = clamp(Number.isFinite(baseScale) ? baseScale : ACTION_TOUCH_SCALE, .88, 1.30);
    const out = {};
    if (safe.aspectClass !== 'foldable') {
        for (const button of buttons)
            out[button.id] = boundedBase;
        return out;
    }
    const hingeRight = safe.hingeExclusion ? safe.hingeExclusion.x + safe.hingeExclusion.width : 0;
    for (const button of buttons) {
        let nearest = Number.POSITIVE_INFINITY;
        for (const other of buttons) {
            if (other.id === button.id)
                continue;
            const d = Math.hypot(button.x - other.x, button.y - other.y) / Math.max(1, button.radius + other.radius);
            nearest = Math.min(nearest, d);
        }
        const crowding = clamp((1.45 - nearest) / .55, 0, 1);
        const hingeDistance = Math.max(0, button.x - hingeRight);
        const hingePressure = clamp((320 - hingeDistance) / 260, 0, 1);
        let scale = boundedBase - crowding * .16 - hingePressure * .09;
        if (button.id === 'auto' || button.id === 'potion' || button.id === 'shop')
            scale -= .04;
        out[button.id] = clamp(scale, .88, boundedBase);
    }
    return out;
}
