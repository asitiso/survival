const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
function clampVector(x, y, max) { const m = Math.hypot(x, y); if (m <= max || m <= .0001)
    return { x, y }; const s = max / m; return { x: x * s, y: y * s }; }
export function rangedEnemyProjectileLaunchOriginPresentation(input, reducedMotion = false) {
    const len = Math.hypot(input.facingX, input.facingY) || 1, fx = input.facingX / len, fy = input.facingY / len, px = -fy, py = fx;
    const pull = clamp(input.pullback, 0, 1), lunge = clamp(input.lunge, 0, 1), resolve = clamp(input.resolve, 0, 1), r = clamp(input.radius, 10, 42), motion = reducedMotion ? .58 : 1;
    const forward = (r * .78 + 3.5 + lunge * 3.2 - pull * 1.8 + resolve * 1.4) * motion, side = (pull * .8 - resolve * .35) * 2.2 * motion;
    const o = clampVector(fx * forward + px * side, fy * forward + py * side, reducedMotion ? 23 : 36);
    return { owner: 'attack-pose', originOffsetX: o.x, originOffsetY: o.y, resolveFollow: resolve, convergeSeconds: .105 * (reducedMotion ? .62 : 1) };
}
export function rangedEnemyVisualLaunchPosition(gameplayPos, offset, ttl, maxTtl) { const max = Math.max(.0001, maxTtl), t = clamp(ttl / max, 0, 1), blend = t * t; return { x: gameplayPos.x + offset.x * blend, y: gameplayPos.y + offset.y * blend }; }
