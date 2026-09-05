import { clamp, normalize } from '../../core/math.js';
function rotateInto(point, center, angle) {
    const dx = point.x - center.x, dy = point.y - center.y, c = Math.cos(-angle), s = Math.sin(-angle);
    return { x: dx * c - dy * s, y: dx * s + dy * c };
}
function rectPenetration(local, halfLength, halfWidth, heroRadius) {
    const dx = halfLength + heroRadius - Math.abs(local.x), dy = halfWidth + heroRadius - Math.abs(local.y);
    return dx >= 0 && dy >= 0 ? Math.min(dx, dy) : 0;
}
function wedgeHit(local, radius, heroRadius) {
    const d = Math.hypot(local.x, local.y);
    if (d > radius * 1.25 + heroRadius)
        return 0;
    const angle = Math.abs(Math.atan2(local.y, local.x));
    const angularMargin = Math.atan2(heroRadius, Math.max(18, d));
    return angle <= .2 + angularMargin ? Math.max(1, radius * 1.25 + heroRadius - d) : 0;
}
export function mythicArenaHazardContact(hazard, point, heroRadius) {
    const r = Math.max(0, hazard.radius), hr = Math.max(0, heroRadius), shape = hazard.geometryShape;
    const angle = hazard.angle ?? 0;
    let penetration = 0;
    let local = rotateInto(point, hazard.pos, angle);
    if (shape === 'ring') {
        const d = Math.hypot(local.x, local.y), inner = r * .58, outer = r;
        const outerOverlap = outer + hr - d, innerOverlap = d + hr - inner;
        penetration = outerOverlap >= 0 && innerOverlap >= 0 ? Math.min(outerOverlap, innerOverlap) : 0;
    }
    else if (shape === 'orbit') {
        const x = local.x / 1.45, y = local.y / .72, d = Math.hypot(x, y);
        penetration = d <= r + hr ? Math.max(1, r + hr - d) : 0;
    }
    else if (shape === 'corridor') {
        penetration = rectPenetration(local, (hazard.length ?? r * 3) / 2, r, hr);
    }
    else if (shape === 'cross') {
        const length = (hazard.length ?? r * 3) / 2;
        penetration = Math.max(rectPenetration(local, length, r, hr), rectPenetration({ x: local.y, y: local.x }, length, r * .7, hr));
    }
    else if (shape === 'clock') {
        penetration = wedgeHit(local, r, hr);
    }
    else {
        const d = Math.hypot(local.x, local.y);
        penetration = d <= r + hr ? Math.max(1, r + hr - d) : 0;
    }
    if (penetration <= 0)
        return { hit: false, penetration: 0, slowMultiplier: 1, push: { x: 0, y: 0 } };
    let push = normalize({ x: point.x - hazard.pos.x, y: point.y - hazard.pos.y });
    if (shape === 'corridor') {
        push = normalize({ x: -Math.sin(angle) * Math.sign(local.y || 1), y: Math.cos(angle) * Math.sign(local.y || 1) });
    }
    else if (shape === 'cross') {
        const useVertical = Math.abs(local.x) < Math.abs(local.y);
        push = useVertical ? normalize({ x: Math.cos(angle) * Math.sign(local.x || 1), y: Math.sin(angle) * Math.sign(local.x || 1) }) : normalize({ x: -Math.sin(angle) * Math.sign(local.y || 1), y: Math.cos(angle) * Math.sign(local.y || 1) });
    }
    const slow = shape === 'clock' ? .82 : shape === 'orbit' ? .86 : shape === 'corridor' || shape === 'cross' ? .9 : shape === 'ring' ? .94 : .92;
    return { hit: true, penetration: clamp(penetration, 0, 96), slowMultiplier: slow, push };
}
