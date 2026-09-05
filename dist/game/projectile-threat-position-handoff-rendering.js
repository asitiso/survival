const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
function clampVector(v, max) { const m = Math.hypot(v.x, v.y); if (m <= max || m <= .0001)
    return { x: v.x, y: v.y }; const s = max / m; return { x: v.x * s, y: v.y * s }; }
export function projectileThreatPositionHandoff(input, reducedMotion = false) { const offset = input.launchOffset, max = Math.max(.0001, input.launchMaxTtl ?? 0), t = clamp((input.launchTtl ?? 0) / max, 0, 1); if (!offset || t <= 0)
    return { owner: 'canonical', pos: { ...input.gameplayPos }, presentationOnly: true }; const blend = t * t, carry = clampVector({ x: offset.x * blend, y: offset.y * blend }, reducedMotion ? 23 : 36); return { owner: 'launch', pos: { x: input.gameplayPos.x + carry.x, y: input.gameplayPos.y + carry.y }, presentationOnly: true }; }
