const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export function heroHitGroundHandoffPresentation(input, reducedMotion = false) {
    const hit = clamp(input.hit, 0, 1), cast = clamp(input.cast, 0, 1), evade = clamp(input.evade, 0, 1), ultimate = clamp(input.ultimate, 0, 1);
    const higherAction = ultimate >= .42 || evade >= .48 || cast >= .32;
    const owner = higherAction ? 'action' : hit >= .34 ? 'hit' : hit >= .055 ? 'recover' : 'ground';
    let groundMotionScale = 1, follow = 0, widthScale = 1, heightScale = 1, alphaScale = 1, maxX = 2.5, maxY = 1.7;
    if (owner === 'hit') {
        groundMotionScale = .46 + .12 * (1 - hit);
        follow = .22;
        widthScale = 1 + hit * .085;
        heightScale = 1 - hit * .17;
        alphaScale = .94 + hit * .06;
    }
    else if (owner === 'recover') {
        const recovery = clamp(hit / .34, 0, 1);
        groundMotionScale = .72 + (1 - recovery) * .22;
        follow = .1 * recovery;
        widthScale = 1 + recovery * .035;
        heightScale = 1 - recovery * .07;
        alphaScale = .97;
    }
    else if (owner === 'action') {
        groundMotionScale = .94;
        follow = .045;
        maxX = .9;
        maxY = .7;
        widthScale = 1;
        heightScale = 1;
        alphaScale = 1;
    }
    if (reducedMotion) {
        groundMotionScale = 1 - (1 - groundMotionScale) * .68;
        follow *= .55;
        maxX *= .68;
        maxY *= .68;
        widthScale = 1 + (widthScale - 1) * .62;
        heightScale = 1 + (heightScale - 1) * .62;
    }
    const ox = Number.isFinite(input.hitOffsetX) ? input.hitOffsetX : 0, oy = Number.isFinite(input.hitOffsetY) ? input.hitOffsetY : 0;
    return { owner, groundMotionScale: clamp(groundMotionScale, .4, 1), shadowOffsetX: clamp(ox * follow, -maxX, maxX), shadowOffsetY: clamp(oy * follow, -maxY, maxY), widthScale: clamp(widthScale, .94, 1.1), heightScale: clamp(heightScale, .8, 1), alphaScale: clamp(alphaScale, .88, 1) };
}
