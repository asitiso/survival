const c = (v, min = 0, max = 1) => Math.max(min, Math.min(max, Number.isFinite(v) ? v : 0));
const bound = (x, y, max) => { const m = Math.hypot(x, y); if (m <= max || m <= .0001)
    return { x, y }; const s = max / m; return { x: x * s, y: y * s }; };
export function bossSpecialOriginAnchorPresentation(input, reducedMotion = false) {
    const charge = c(input.charge), recovery = c(input.recovery), stagger = c(input.stagger), handoff = c(input.handoffStrength), rx = Number.isFinite(input.rebaseOffsetX) ? input.rebaseOffsetX : 0, ry = Number.isFinite(input.rebaseOffsetY) ? input.rebaseOffsetY : 0, bx = Number.isFinite(input.bodyOffsetX) ? input.bodyOffsetX : 0, by = Number.isFinite(input.bodyOffsetY) ? input.bodyOffsetY : 0, rebaseMag = Math.hypot(rx, ry);
    const forcedBody = stagger > .45 || recovery > .68, groundWeight = forcedBody ? 0 : c((handoff * .68 + (rebaseMag > 4 ? .22 : 0)) * charge * (1 - recovery * .72) * (1 - stagger), 0, 1), owner = groundWeight > .3 ? 'ground' : 'body', motion = reducedMotion ? .62 : 1;
    const bodyWeight = 1 - groundWeight, o = bound((bx * .42 * bodyWeight + rx * groundWeight) * motion, (by * .42 * bodyWeight + ry * groundWeight) * motion, reducedMotion ? 17 : 27);
    return { owner, anchorOffsetX: o.x, anchorOffsetY: o.y, groundWeight, presentationOnly: true };
}
