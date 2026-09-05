export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
export function clampMagnitude(v, maxMagnitude = 1) {
    const mag = Math.hypot(v.x, v.y);
    if (mag <= maxMagnitude || mag === 0)
        return { x: v.x, y: v.y };
    const scale = maxMagnitude / mag;
    return { x: v.x * scale, y: v.y * scale };
}
export function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}
export function normalize(v) {
    const mag = Math.hypot(v.x, v.y);
    return mag === 0 ? { x: 0, y: 0 } : { x: v.x / mag, y: v.y / mag };
}
export function lerp(a, b, t) {
    return a + (b - a) * t;
}
