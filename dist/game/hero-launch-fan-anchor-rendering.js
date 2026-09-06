const finite = (v) => Number.isFinite(v) ? v : 0;
export function heroLaunchFanAnchorPresentation(input, reducedMotion = false) {
    const bx = finite(input.baseOffsetX), by = finite(input.baseOffsetY), count = Math.max(1, Math.round(finite(input.count))), idx = Math.max(0, Math.min(count - 1, Math.round(finite(input.index))));
    if (count <= 1)
        return { offsetX: bx, offsetY: by, lateralOffset: 0, presentationOnly: true };
    const m = Math.hypot(input.facingX, input.facingY) || 1, fx = finite(input.facingX) / m, fy = finite(input.facingY) / m, px = -fy, py = fx, t = idx / (count - 1) - .5, max = (input.kind === 'ultimate' ? 5.5 : 4) * (reducedMotion ? .58 : 1), lateralOffset = t * 2 * max;
    return { offsetX: bx + px * lateralOffset, offsetY: by + py * lateralOffset, lateralOffset, presentationOnly: true };
}
