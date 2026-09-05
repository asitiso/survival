const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export function bossSpecialBodyLanguagePresentation(archetype, phase, specialTimer, facingX, facingY, reducedMotion = false) {
    const charge = clamp(1 - clamp(Number.isFinite(specialTimer) ? specialTimer : 99, 0, 1.2) / 1.2, 0, 1);
    const len = Math.hypot(facingX, facingY) || 1, fx = facingX / len, fy = facingY / len;
    const phaseWeight = phase === 3 ? 1.18 : phase === 2 ? 1.08 : 1;
    const motionScale = reducedMotion ? .4 : 1;
    let stance = 'flare', forward = 0, lift = 0, rotation = 0, scaleX = 1, scaleY = 1;
    if (archetype === 'inferno') {
        stance = 'flare';
        forward = 2.2 * charge * phaseWeight;
        scaleX = 1 + charge * .055 * motionScale;
        scaleY = 1 + charge * .025 * motionScale;
    }
    else if (archetype === 'summoner') {
        stance = 'channel';
        lift = -4.2 * charge * phaseWeight;
        rotation = (fx * .08 - fy * .05) * charge * .035 * motionScale;
        scaleX = 1 + charge * .018 * motionScale;
        scaleY = 1 + charge * .045 * motionScale;
    }
    else if (archetype === 'juggernaut') {
        stance = 'charge';
        forward = -4.4 * charge * phaseWeight;
        lift = 1.8 * charge;
        rotation = (fy - fx * .12) * charge * .045 * motionScale;
        scaleX = 1 + charge * .07 * motionScale;
        scaleY = 1 - charge * .075 * motionScale;
    }
    else if (archetype === 'abyssWitch') {
        stance = 'levitate';
        lift = -5.2 * charge * phaseWeight;
        rotation = (fx * .05 + fy * .06) * charge * .04 * motionScale;
        scaleX = 1 - charge * .012 * motionScale;
        scaleY = 1 + charge * .055 * motionScale;
    }
    else if (archetype === 'twinMaw') {
        stance = 'split';
        forward = .9 * charge;
        rotation = (.085 + Math.abs(fy) * .025) * charge * phaseWeight * motionScale;
        scaleX = 1 + charge * .052 * motionScale;
        scaleY = 1 - charge * .025 * motionScale;
    }
    else {
        stance = 'compress';
        lift = .8 * charge;
        rotation = (fy - fx * .1) * charge * .018 * motionScale;
        scaleX = 1 - charge * .04 * motionScale;
        scaleY = 1 + charge * .018 * motionScale;
    }
    const offsetX = (fx * forward - fy * lift * .08) * motionScale;
    const offsetY = (fy * forward + lift) * motionScale;
    const auraAlpha = charge <= 0 ? 0 : Math.min(.34, .12 + charge * .19 + (phase - 1) * .015);
    const auraRadiusBoost = charge * (8 + phase * 4) * (reducedMotion ? .7 : 1);
    return { archetype, stance, phase, charge, offsetX, offsetY, rotation, scaleX, scaleY, auraAlpha, auraRadiusBoost };
}
