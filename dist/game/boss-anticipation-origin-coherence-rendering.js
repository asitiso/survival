const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(v) ? v : 0));
const bound = (x, y, max) => { const m = Math.hypot(x, y); if (m <= max || m <= .0001)
    return { x, y }; const s = max / m; return { x: x * s, y: y * s }; };
export function bossAnticipationOriginCoherencePresentation(input, reducedMotion = false) {
    const charge = clamp(input.charge), recovery = clamp(input.recovery), stagger = clamp(input.stagger), disp = clamp(input.displacementStrength), rebaseMag = Math.hypot(Number.isFinite(input.rebaseOffsetX) ? input.rebaseOffsetX : 0, Number.isFinite(input.rebaseOffsetY) ? input.rebaseOffsetY : 0);
    const dangerOwnership = charge * (1 - recovery * .82) * (1 - stagger), groundLock = clamp((disp * .7 + (rebaseMag > 4 ? .26 : 0)) * dangerOwnership), bodyLock = 1 - groundLock, owner = groundLock > .34 ? 'ground-rebase' : 'body';
    const bx = Number.isFinite(input.bodyOffsetX) ? input.bodyOffsetX : 0, by = Number.isFinite(input.bodyOffsetY) ? input.bodyOffsetY : 0, rx = Number.isFinite(input.rebaseOffsetX) ? input.rebaseOffsetX : 0, ry = Number.isFinite(input.rebaseOffsetY) ? input.rebaseOffsetY : 0, motion = reducedMotion ? .62 : 1;
    const max = reducedMotion ? 18 : 28, o = bound((bx * bodyLock * .34 + rx * groundLock) * motion, (by * bodyLock * .34 + ry * groundLock) * motion, max);
    return { owner: ringOwner(owner, stagger), ringOffsetX: o.x, ringOffsetY: o.y, groundLock: stagger > .45 ? 0 : groundLock, bodyLock: stagger > .45 ? 1 : bodyLock, presentationOnly: true };
}
function ringOwner(owner, stagger) { return stagger > .45 ? 'body' : owner; }
