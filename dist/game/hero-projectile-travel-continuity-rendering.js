const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export function heroProjectileTravelContinuityPresentation(input, reducedMotion = false) {
    const max = Math.max(.0001, Number.isFinite(input.maxTtl) ? input.maxTtl : .13), life = clamp((Number.isFinite(input.ttl) ? input.ttl : 0) / max, 0, 1), dx = input.projectile.x - input.origin.x, dy = input.projectile.y - input.origin.y, d = Math.hypot(dx, dy), cap = reducedMotion ? 48 : 76, len = Math.min(d, cap), s = d > .0001 ? len / d : 0, end = { x: input.origin.x + dx * s, y: input.origin.y + dy * s };
    return { visible: life > 0 && d > 2, start: { ...input.origin }, end, length: len, alpha: (.12 + .34 * life) * (reducedMotion ? .72 : 1) };
}
