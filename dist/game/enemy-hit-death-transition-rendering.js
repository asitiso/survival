const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const TIER = { normal: .46, heavy: .74, critical: 1 };
const profile = (type) => {
    if (type === 'assassin' || type === 'hound' || type === 'golden')
        return { role: 'agile', kick: 1.05, tumble: 1.18, settle: .62, collapse: .58 };
    if (type === 'siegeGolem' || type === 'shieldbearer' || type === 'brute')
        return { role: 'heavy', kick: .72, tumble: .28, settle: 1.38, collapse: 1.3 };
    if (type === 'archer' || type === 'shaman' || type === 'nullifier')
        return { role: 'light', kick: .9, tumble: .72, settle: .82, collapse: .76 };
    return { role: 'medium', kick: .82, tumble: .56, settle: 1, collapse: .92 };
};
const unit = (x, y, fx = 1, fy = 0) => { const len = Math.hypot(x, y); return len > .001 ? { x: x / len, y: y / len } : { x: fx, y: fy }; };
export function enemyHitStaggerPresentation(type, hitFlash, tier, impactX, impactY, motion, reducedMotion = false) {
    const p = profile(type), strength = clamp(hitFlash / .1, 0, 1) * TIER[tier];
    const dir = unit(impactX, impactY, -(motion?.facingX ?? 1), -(motion?.facingY ?? 0));
    const motionScale = reducedMotion ? .38 : 1;
    const kick = (2.15 + 3.25 * strength) * p.kick * strength * motionScale;
    const offsetX = dir.x * kick, offsetY = dir.y * kick + strength * p.settle * .42 * motionScale;
    const turn = motion?.turn ?? 0;
    const rotation = clamp((dir.y - dir.x * .22 + turn * .18) * .115 * p.tumble * strength * motionScale, -.18, .18);
    const scaleX = clamp(1 + strength * .025 * p.kick * motionScale, .93, 1.07);
    const scaleY = clamp(1 - strength * .035 * p.collapse * motionScale, .91, 1.05);
    return { stagger: strength, offsetX, offsetY, rotation, scaleX, scaleY };
}
export function enemyDeathTransitionPresentation(type, snapshot, progress, reducedMotion = false) {
    const p = profile(type), t = clamp(progress, 0, 1), tier = TIER[snapshot.tier];
    const dir = unit(snapshot.impactX, snapshot.impactY, -snapshot.facingX, -snapshot.facingY);
    const carry = clamp(snapshot.motionBlend * .52 + tier * .54, 0, 1);
    const motionScale = reducedMotion ? .38 : 1;
    const impactKick = (2.15 + 3.25 * tier) * p.kick * tier * (1 - t * .74);
    const travel = (snapshot.motionBlend * (1 - t) * 2.5 + carry * t * 1.25) * motionScale;
    const offsetX = (dir.x * impactKick + snapshot.facingX * travel) * motionScale;
    const offsetY = (dir.y * impactKick + snapshot.facingY * travel + t * t * 6.2 * p.settle) * motionScale;
    const rotation = clamp(((dir.y - dir.x * .22) * .115 * p.tumble * tier + snapshot.turn * .035) * (1 - t * .2) + t * .15 * p.tumble * Math.sign(snapshot.turn || dir.x || 1), -.32, .32) * motionScale;
    const scaleX = clamp(1 + t * .035 * p.tumble * motionScale, .88, 1.1);
    const scaleY = clamp(1 - t * .12 * p.collapse * motionScale, .78, 1.05);
    const alpha = clamp(1 - t * .96, 0, .98);
    return { role: p.role, carry, alpha, offsetX, offsetY, rotation, scaleX, scaleY };
}
