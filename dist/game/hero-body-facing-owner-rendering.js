const clamp = (v) => Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));
const unit = (x, y, fx = 1, fy = 0) => { const len = Math.hypot(x, y); if (len > .0001)
    return { x: x / len, y: y / len }; const f = Math.hypot(fx, fy) || 1; return { x: fx / f, y: fy / f }; };
export function heroBodyFacingOwnerPresentation(input, _reducedMotion = false) {
    const movement = unit(input.currentFacing.x, input.currentFacing.y), castRetention = input.cast.owner === 'cast' ? clamp(input.cast.retention) : 0, ultimateRetention = input.ultimate.owner === 'ultimate' ? clamp(input.ultimate.retention) : 0;
    let owner = 'movement', facing = movement, actionRetention = 0;
    if (ultimateRetention > .08) {
        owner = 'ultimate';
        facing = unit(input.ultimate.facingX, input.ultimate.facingY, movement.x, movement.y);
        actionRetention = ultimateRetention;
    }
    else if (castRetention > .08) {
        owner = 'cast';
        facing = unit(input.cast.facingX, input.cast.facingY, movement.x, movement.y);
        actionRetention = castRetention;
    }
    const mirrorX = facing.x < -.08 ? -1 : 1;
    return { owner, facingX: facing.x, facingY: facing.y, bodyAngle: Math.atan2(facing.y, facing.x), mirrorX, actionRetention, presentationOnly: true };
}
