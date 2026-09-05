import { foldableThumbZones } from './foldable-thumb-zones.js';
function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function rectContains(r, p) { return p.x >= r.x && p.x <= r.x + r.width && p.y >= r.y && p.y <= r.y + r.height; }
function fnv(text) { let h = 2166136261; for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
} return (h >>> 0).toString(16).toUpperCase().padStart(8, '0'); }
function round1(value) { return Math.round(value * 10) / 10; }
export function foldableThumbTravelAudit(safe, buttons) {
    if (safe.aspectClass !== 'foldable' || !safe.hingeExclusion) {
        return { applicable: false, ok: true, signature: 'FT-NA', leftAnchor: { x: 0, y: 0 }, rightAnchor: { x: 0, y: 0 }, maxLeftTravel: 0, maxRightTravel: 0, averageRightTravel: 0, reachableActionCount: buttons.length, unreachableActions: [], crossHingeActions: [], hingeClear: true, issues: [] };
    }
    const zones = foldableThumbZones(safe), hinge = safe.hingeExclusion;
    const leftAnchor = { x: (safe.joystickMinX + safe.joystickMaxX) / 2, y: (safe.joystickMinY + safe.joystickMaxY) / 2 };
    const rightAnchor = { x: zones.right.x + zones.right.width * .66, y: zones.right.y + zones.right.height * .66 };
    const leftCorners = [
        { x: safe.joystickMinX, y: safe.joystickMinY }, { x: safe.joystickMaxX, y: safe.joystickMinY },
        { x: safe.joystickMinX, y: safe.joystickMaxY }, { x: safe.joystickMaxX, y: safe.joystickMaxY },
    ];
    const maxLeftTravel = Math.max(...leftCorners.map((p) => distance(leftAnchor, p)));
    const actionDistances = buttons.map((button) => ({ id: button.id, distance: distance(rightAnchor, button), point: { x: button.x, y: button.y } }));
    const unreachableActions = actionDistances.filter((entry) => !rectContains(zones.right, entry.point) || entry.distance > 560).map((entry) => entry.id);
    const crossHingeActions = buttons.filter((button) => button.x <= hinge.x + hinge.width).map((button) => button.id);
    const maxRightTravel = actionDistances.length ? Math.max(...actionDistances.map((entry) => entry.distance)) : 0;
    const averageRightTravel = actionDistances.length ? actionDistances.reduce((sum, entry) => sum + entry.distance, 0) / actionDistances.length : 0;
    const issues = [];
    if (maxLeftTravel > 370)
        issues.push('left-thumb-travel');
    if (maxRightTravel > 560)
        issues.push('right-thumb-travel');
    if (averageRightTravel > 360)
        issues.push('right-thumb-average');
    if (unreachableActions.length)
        issues.push(`unreachable:${unreachableActions.join(',')}`);
    if (crossHingeActions.length)
        issues.push(`hinge-cross:${crossHingeActions.join(',')}`);
    const signaturePayload = [round1(maxLeftTravel), round1(maxRightTravel), round1(averageRightTravel), buttons.length, unreachableActions.join(','), crossHingeActions.join(',')].join('|');
    return {
        applicable: true, ok: issues.length === 0, signature: `FT-${fnv(signaturePayload)}`,
        leftAnchor, rightAnchor, maxLeftTravel: round1(maxLeftTravel), maxRightTravel: round1(maxRightTravel), averageRightTravel: round1(averageRightTravel),
        reachableActionCount: buttons.length - unreachableActions.length, unreachableActions, crossHingeActions, hingeClear: crossHingeActions.length === 0, issues,
    };
}
