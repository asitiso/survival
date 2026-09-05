const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export function advanceHeroUltimateBodyState(previous, trigger, dt, _reducedMotion = false) {
    if (trigger)
        return { kind: trigger, elapsed: 0 };
    const prev = previous ?? { kind: null, elapsed: 0 };
    if (!prev.kind)
        return prev;
    const elapsed = prev.elapsed + clamp(Number.isFinite(dt) ? dt : 0, 0, .12);
    if (elapsed >= .62)
        return { kind: null, elapsed: 0 };
    return { kind: prev.kind, elapsed };
}
export function heroUltimateBodyPresentation(state, facingX, facingY, reducedMotion = false) {
    const current = state ?? { kind: null, elapsed: 0 };
    if (!current.kind)
        return { windup: 0, release: 0, recovery: 0, stance: 'neutral', castRecoverySuppression: 0, offsetX: 0, offsetY: 0, rotation: 0, scaleX: 1, scaleY: 1 };
    const age = clamp(current.elapsed, 0, .62);
    const windup = clamp(1 - age / .13, 0, 1);
    const release = age < .04 ? clamp(age / .04, 0, 1) : clamp(1 - (age - .04) / .18, 0, 1);
    const recovery = age < .14 ? 0 : clamp(1 - (age - .14) / .42, 0, 1);
    const len = Math.hypot(facingX, facingY) || 1, fx = facingX / len, fy = facingY / len;
    const motionScale = reducedMotion ? .36 : 1;
    let offsetX = 0, offsetY = 0, rotation = 0, scaleX = 1, scaleY = 1;
    let stance;
    if (current.kind === 'meteorStorm') {
        offsetX = (fx * release * 3.6 - fx * windup * .65 + fx * recovery * .75) * motionScale;
        offsetY = (windup * 1.8 - release * 4.7 + recovery * 1.15 + fy * release * .8) * motionScale;
        rotation = clamp((fy - fx * .18) * release * .055 - fy * windup * .018, -.14, .14) * motionScale;
        scaleX = clamp(1 + (windup * .02 + release * .038 - recovery * .012) * motionScale, .92, 1.09);
        scaleY = clamp(1 + (-windup * .055 + release * .045 - recovery * .018) * motionScale, .9, 1.09);
        stance = release >= Math.max(windup, recovery) ? 'meteor-release' : windup >= recovery ? 'meteor-windup' : 'meteor-recovery';
    }
    else {
        offsetX = (fx * release * 1.45 - fx * windup * 1.15 - fy * release * .8 + fx * recovery * .3) * motionScale;
        offsetY = (windup * .95 - release * 1.35 + recovery * .7 + fy * release * .5) * motionScale;
        rotation = clamp(((fy - fx * .45) * release * .12 + (fx + fy * .25) * windup * .028 - (fy - fx * .2) * recovery * .04), -.15, .15) * motionScale;
        scaleX = clamp(1 + (-windup * .038 - release * .062 + recovery * .018) * motionScale, .9, 1.08);
        scaleY = clamp(1 + (windup * .018 + release * .055 - recovery * .018) * motionScale, .92, 1.1);
        stance = release >= Math.max(windup, recovery) ? 'void-release' : windup >= recovery ? 'void-windup' : 'void-recovery';
    }
    const maxOffset = reducedMotion ? 2.6 : 6.8, magnitude = Math.hypot(offsetX, offsetY);
    if (magnitude > maxOffset) {
        const ratio = maxOffset / magnitude;
        offsetX *= ratio;
        offsetY *= ratio;
    }
    const castRecoverySuppression = clamp(Math.max(windup * .34, release * .88, recovery * .58), 0, .92);
    return { windup, release, recovery, stance, castRecoverySuppression, offsetX, offsetY, rotation, scaleX, scaleY };
}
