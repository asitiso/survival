import { safeJoystickOrigin } from './landscape-hud.js';
import { foldableThumbIntent, foldableThumbZones } from './foldable-thumb-zones.js';
function insideHinge(p, safe) {
    const h = safe.hingeExclusion;
    if (!h)
        return false;
    return p.x >= h.x && p.x <= h.x + h.width && p.y >= h.y && p.y <= h.y + h.height;
}
function nearestAction(point, buttons, maxDistance = 150) {
    let best = null, bestD = maxDistance;
    for (const b of buttons) {
        const d = Math.hypot(point.x - b.x, point.y - b.y);
        if (d < bestD) {
            bestD = d;
            best = b.id;
        }
    }
    return best;
}
export function resolveFoldableDeadSpace(point, safe, buttons) {
    if (safe.aspectClass !== 'foldable' || !safe.hingeExclusion)
        return { enabled: false, intent: 'neutral', recovered: false, joystickOrigin: null, actionId: null };
    if (insideHinge(point, safe))
        return { enabled: true, intent: 'neutral', recovered: false, joystickOrigin: null, actionId: null };
    const direct = foldableThumbIntent(point, safe);
    if (direct === 'left')
        return { enabled: true, intent: 'left', recovered: false, joystickOrigin: safeJoystickOrigin(point, safe), actionId: null };
    if (direct === 'right') {
        const actionId = nearestAction(point, buttons, 150);
        return { enabled: true, intent: 'right', recovered: Boolean(actionId), joystickOrigin: null, actionId };
    }
    const zones = foldableThumbZones(safe), h = safe.hingeExclusion, band = 36;
    if (point.y >= zones.left.y && point.x < h.x && point.x >= h.x - band) {
        const origin = safeJoystickOrigin({ x: Math.min(point.x, h.x - 42), y: point.y }, safe);
        return { enabled: true, intent: 'left', recovered: true, joystickOrigin: origin, actionId: null };
    }
    const hingeRight = h.x + h.width;
    if (point.y >= zones.right.y && point.x > hingeRight && point.x <= hingeRight + band) {
        const actionId = nearestAction(point, buttons, 150);
        return { enabled: true, intent: actionId ? 'right' : 'neutral', recovered: Boolean(actionId), joystickOrigin: null, actionId };
    }
    return { enabled: true, intent: 'neutral', recovered: false, joystickOrigin: null, actionId: null };
}
