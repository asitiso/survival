const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
function clampVector(v, max) { const m = Math.hypot(v.x, v.y); if (m <= max || m <= .0001)
    return { x: v.x, y: v.y }; const s = max / m; return { x: v.x * s, y: v.y * s }; }
export function projectileImpactEntryOffset(launchOffset, launchTtl, launchMaxTtl, reducedMotion = false) { if (!launchOffset)
    return { x: 0, y: 0 }; const max = Math.max(.0001, Number.isFinite(launchMaxTtl ?? 0) ? launchMaxTtl ?? 0 : 0), t = clamp((Number.isFinite(launchTtl ?? 0) ? launchTtl ?? 0 : 0) / max, 0, 1); if (t <= 0)
    return { x: 0, y: 0 }; const blend = t * t * (reducedMotion ? .58 : 1); return clampVector({ x: launchOffset.x * blend, y: launchOffset.y * blend }, reducedMotion ? 10 : 18); }
export function projectileImpactVisualPosition(canonicalImpact, entryOffset, ttl, maxTtl) { const max = Math.max(.0001, Number.isFinite(maxTtl) ? maxTtl : 0), t = clamp((Number.isFinite(ttl) ? ttl : 0) / max, 0, 1), blend = t * t; return { x: canonicalImpact.x + entryOffset.x * blend, y: canonicalImpact.y + entryOffset.y * blend }; }
