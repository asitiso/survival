export const CORE_GUARD_PRESSURE_VECTOR_HOLD_SECONDS = .16;
export function createCoreGuardPressureVectorHysteresisState() { return { vector: null, holdRemaining: 0, presentationOnly: true }; }
function normalized(v) { if (!v || !Number.isFinite(v.x) || !Number.isFinite(v.y))
    return null; const d = Math.hypot(v.x, v.y); return d > .001 ? { x: v.x / d, y: v.y / d } : null; }
function blend(a, b, k) { const x = a.x * (1 - k) + b.x * k, y = a.y * (1 - k) + b.y * k, d = Math.hypot(x, y); return d > .001 ? { x: x / d, y: y / d } : { ...b }; }
export function advanceCoreGuardPressureVectorHysteresis(previous, incoming, dt, reducedMotion = false) {
    const next = normalized(incoming), delta = Math.max(0, Number.isFinite(dt) ? dt : 0), hold = Math.max(0, previous.holdRemaining - delta);
    if (!next)
        return { vector: previous.vector ? { ...previous.vector } : null, holdRemaining: hold, presentationOnly: true };
    if (!previous.vector || reducedMotion)
        return { vector: next, holdRemaining: CORE_GUARD_PRESSURE_VECTOR_HOLD_SECONDS, presentationOnly: true };
    const dot = previous.vector.x * next.x + previous.vector.y * next.y;
    if (hold > 0 && dot < .35)
        return { vector: { ...previous.vector }, holdRemaining: hold, presentationOnly: true };
    if (hold <= 0)
        return { vector: next, holdRemaining: CORE_GUARD_PRESSURE_VECTOR_HOLD_SECONDS, presentationOnly: true };
    return { vector: blend(previous.vector, next, .28), holdRemaining: Math.max(hold, CORE_GUARD_PRESSURE_VECTOR_HOLD_SECONDS * .42), presentationOnly: true };
}
