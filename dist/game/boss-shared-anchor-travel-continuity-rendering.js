const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export function bossSharedAnchorTravelContinuityPresentation(input, reducedMotion = false) {
    const max = Math.max(.0001, Number.isFinite(input.maxTtl) ? input.maxTtl : .15), life = clamp((Number.isFinite(input.ttl) ? input.ttl : 0) / max, 0, 1), dx = input.projectile.x - input.anchor.x, dy = input.projectile.y - input.anchor.y, d = Math.hypot(dx, dy), cap = reducedMotion ? 58 : 92, len = Math.min(d, cap), s = d > .0001 ? len / d : 0, end = { x: input.anchor.x + dx * s, y: input.anchor.y + dy * s };
    return { visible: life > 0 && d > 3, start: { ...input.anchor }, end, length: len, alpha: (.1 + .32 * life) * (reducedMotion ? .7 : 1) };
}
