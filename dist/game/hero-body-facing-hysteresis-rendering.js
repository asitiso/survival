const unit = (x, y) => { const l = Math.hypot(x, y) || 1; return { x: x / l, y: y / l }; };
const clamp = (v) => Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));
const angleDelta = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
export function createHeroBodyFacingHysteresisState(initial = { x: 1, y: 0 }) { const f = unit(initial.x, initial.y); return { owner: 'movement', facingX: f.x, facingY: f.y, mirrorX: f.x < 0 ? -1 : 1, hold: 0 }; }
export function advanceHeroBodyFacingHysteresisState(state, desired, dt, reducedMotion = false) {
    const current = state ?? createHeroBodyFacingHysteresisState({ x: desired.facingX, y: desired.facingY }), target = unit(desired.facingX, desired.facingY), step = Math.max(0, Number.isFinite(dt) ? dt : 0);
    if (reducedMotion)
        return { owner: desired.owner, facingX: target.x, facingY: target.y, mirrorX: desired.mirrorX, hold: 0 };
    let owner = current.owner, hold = Math.max(0, current.hold - step), tx = target.x, ty = target.y;
    if (desired.owner !== 'movement') {
        owner = desired.owner;
        hold = .12;
    }
    else if (current.owner !== 'movement' && hold > 0) {
        owner = current.owner;
        tx = current.facingX;
        ty = current.facingY;
    }
    else
        owner = 'movement';
    const fromAngle = Math.atan2(current.facingY, current.facingX), toAngle = Math.atan2(ty, tx), blend = clamp(step / .11), angle = fromAngle + angleDelta(fromAngle, toAngle) * blend, facing = { x: Math.cos(angle), y: Math.sin(angle) };
    let mirrorX = current.mirrorX;
    if (facing.x > .18)
        mirrorX = 1;
    else if (facing.x < -.18)
        mirrorX = -1;
    return { owner, facingX: facing.x, facingY: facing.y, mirrorX, hold };
}
export function heroBodyFacingHysteresisPresentation(state) { const s = state ?? createHeroBodyFacingHysteresisState(); return { ...s, bodyAngle: Math.atan2(s.facingY, s.facingX), presentationOnly: true }; }
