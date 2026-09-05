export interface Vec2 { x: number; y: number; }

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function clampMagnitude(v: Vec2, maxMagnitude = 1): Vec2 {
  const mag = Math.hypot(v.x, v.y);
  if (mag <= maxMagnitude || mag === 0) return { x: v.x, y: v.y };
  const scale = maxMagnitude / mag;
  return { x: v.x * scale, y: v.y * scale };
}

export function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function normalize(v: Vec2): Vec2 {
  const mag = Math.hypot(v.x, v.y);
  return mag === 0 ? { x: 0, y: 0 } : { x: v.x / mag, y: v.y / mag };
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
