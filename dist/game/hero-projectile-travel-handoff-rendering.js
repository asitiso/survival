const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export function heroProjectileTravelHandoffPresentation(input, reducedMotion = false) {
    const life = clamp(input.ttl / Math.max(.0001, input.maxTtl), 0, 1), dx = input.projectile.x - input.origin.x, dy = input.projectile.y - input.origin.y, d = Math.hypot(dx, dy), cap = reducedMotion ? 48 : 76, overflow = Math.max(0, d - cap), s = d > .0001 ? overflow / d : 0, start = { x: input.origin.x + dx * s, y: input.origin.y + dy * s };
    return { visible: life > 0 && d > 2, start, end: { ...input.projectile }, length: Math.min(d, cap), alpha: (.1 + .3 * life) * (reducedMotion ? .7 : 1) };
}
