const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(v) ? v : 0));
const norm = (x, y, fallbackX = 1, fallbackY = 0) => { const m = Math.hypot(x, y); if (m > .0001)
    return { x: x / m, y: y / m }; const fm = Math.hypot(fallbackX, fallbackY) || 1; return { x: fallbackX / fm, y: fallbackY / fm }; };
const bounded = (x, y, max) => { const m = Math.hypot(x, y); if (m <= max || m <= .0001)
    return { x, y }; const s = max / m; return { x: x * s, y: y * s }; };
export function heroActionLaunchOriginCoherencePresentation(input, reducedMotion = false) {
    const movement = norm(input.movementFacingX, input.movementFacingY, 1, 0), body = norm(input.bodyFacingX, input.bodyFacingY, movement.x, movement.y), action = input.owner !== 'movement';
    const facing = action ? body : movement, pose = clamp(input.poseStrength), bodyFollow = action ? clamp(.58 + pose * .34, .58, .92) : .34;
    const radius = clamp(input.radius, 10, 48), motion = reducedMotion ? .62 : 1, ultimate = input.kind === 'ultimate';
    const forwardDistance = clamp(radius * (ultimate ? .96 : .74) * (action ? 1 : .88) * (1 + pose * (ultimate ? .14 : .08)) * motion, ultimate ? 12 : 9, ultimate ? 29 : 23);
    const bodyX = Number.isFinite(input.bodyOffsetX) ? input.bodyOffsetX : 0, bodyY = Number.isFinite(input.bodyOffsetY) ? input.bodyOffsetY : 0;
    const maxBody = reducedMotion ? 6.5 : 12.5, bb = bounded(bodyX * bodyFollow, bodyY * bodyFollow, maxBody), max = ultimate ? (reducedMotion ? 27 : 38) : (reducedMotion ? 22 : 31), o = bounded(bb.x + facing.x * forwardDistance, bb.y + facing.y * forwardDistance, max);
    return { owner: action ? 'action-pose' : 'movement', facingX: facing.x, facingY: facing.y, originOffsetX: o.x, originOffsetY: o.y, forwardDistance, bodyFollow, convergeSeconds: (ultimate ? .135 : .1) * (reducedMotion ? .62 : 1), presentationOnly: true };
}
