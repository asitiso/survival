const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export function advanceBossGroundOriginRebaseState(previous, input, dt, radius, reducedMotion = false) {
    const x = Number.isFinite(input.x) ? input.x : 0, y = Number.isFinite(input.y) ? input.y : 0, cycle = Number.isFinite(input.cycle) ? input.cycle : 0, phase = input.phase;
    if (!previous)
        return { x, y, phase, cycle, rebase: 0, offsetX: 0, offsetY: 0 };
    const safeDt = clamp(Number.isFinite(dt) ? dt : 0, 0, .12), dx = x - previous.x, dy = y - previous.y, dist = Math.hypot(dx, dy), large = dist >= Math.max(34, Math.max(1, radius) * 1.25), phaseChanged = phase !== previous.phase, cycleChanged = cycle !== previous.cycle;
    const duration = reducedMotion ? .13 : .22, decayed = Math.max(0, previous.rebase - safeDt / duration);
    let rebase = decayed, offsetX = previous.offsetX, offsetY = previous.offsetY;
    if (large || phaseChanged || cycleChanged) {
        rebase = large ? 1 : phaseChanged ? .68 : .58;
        const follow = large ? 1 : .35, cap = Math.max(6, radius * (reducedMotion ? .36 : .6));
        offsetX = clamp(-dx * follow, -cap, cap);
        offsetY = clamp(-dy * follow, -cap * .72, cap * .72);
    }
    else if (rebase <= 0) {
        offsetX = 0;
        offsetY = 0;
    }
    return { x, y, phase, cycle, rebase: clamp(rebase, 0, 1), offsetX, offsetY };
}
export function bossGroundOriginRebasePresentation(state, reducedMotion = false) {
    const rebase = clamp(state?.rebase ?? 0, 0, 1), motionScale = reducedMotion ? .72 : 1;
    return { groundOffsetX: (state?.offsetX ?? 0) * rebase * motionScale, groundOffsetY: (state?.offsetY ?? 0) * rebase * motionScale, contactPulseScale: clamp(1 - rebase * .86, .08, 1), shadowMotionScale: clamp(1 - rebase * .42, .5, 1), locomotionSettleScale: clamp(1 - rebase * .72, .2, 1) };
}
