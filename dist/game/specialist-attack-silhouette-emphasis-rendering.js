const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
export function specialistAttackSilhouetteEmphasisPresentation(input, reducedMotion = false) {
    const pullback = clamp(input.pullback), lunge = clamp(input.lunge), resolve = clamp(input.resolve), hit = clamp(input.hit);
    const phase = lunge > .08 ? 'strike' : pullback > .08 ? 'windup' : resolve > .08 ? 'resolve' : 'neutral';
    let alphaScale = 1, trailDistanceScale = 1, widthScale = 1, heightScale = 1, lateralOffset = 0;
    const type = input.type;
    if (phase === 'windup') {
        alphaScale = .72 + .12 * pullback;
        trailDistanceScale = .56 + .16 * (1 - pullback);
        if (type === 'shieldbearer') {
            widthScale = .94;
            heightScale = 1 + .09 * pullback;
            lateralOffset = 0;
        }
        else if (type === 'assassin') {
            widthScale = 1 + .035 * pullback;
            heightScale = 1 - .025 * pullback;
            lateralOffset = 3.2 * pullback;
        }
        else if (type === 'siegeGolem') {
            widthScale = 1 + .02 * pullback;
            heightScale = 1 + .045 * pullback;
            lateralOffset = .6 * pullback;
        }
        else {
            widthScale = .98;
            heightScale = 1 + .03 * pullback;
            lateralOffset = 1.4 * pullback;
        }
    }
    else if (phase === 'strike') {
        alphaScale = .9 + .1 * lunge;
        trailDistanceScale = .72 + .1 * (1 - lunge);
        if (type === 'assassin') {
            widthScale = 1 + .18 * lunge;
            heightScale = 1 - .14 * lunge;
            lateralOffset = 4.8 * lunge;
        }
        else if (type === 'siegeGolem') {
            widthScale = 1 + .09 * lunge;
            heightScale = 1 - .055 * lunge;
            lateralOffset = .8 * lunge;
        }
        else if (type === 'shieldbearer') {
            widthScale = 1 + .045 * lunge;
            heightScale = 1 - .025 * lunge;
            lateralOffset = .4 * lunge;
        }
        else {
            widthScale = 1 + .075 * lunge;
            heightScale = 1 - .045 * lunge;
            lateralOffset = 2.2 * lunge;
        }
    }
    else if (phase === 'resolve') {
        alphaScale = .62 - .18 * resolve;
        trailDistanceScale = .52 - .12 * resolve;
        widthScale = 1 + .02 * resolve;
        heightScale = 1 - .015 * resolve;
    }
    const hitYield = 1 - hit * .72;
    alphaScale *= hitYield;
    trailDistanceScale = .35 + (trailDistanceScale - .35) * hitYield;
    widthScale = 1 + (widthScale - 1) * hitYield;
    heightScale = 1 + (heightScale - 1) * hitYield;
    lateralOffset *= hitYield;
    if (reducedMotion) {
        alphaScale = Math.min(alphaScale, .55);
        trailDistanceScale = Math.min(trailDistanceScale, .55);
        widthScale = 1 + (widthScale - 1) * .35;
        heightScale = 1 + (heightScale - 1) * .35;
        lateralOffset *= .25;
    }
    return { phase, alphaScale: clamp(alphaScale), trailDistanceScale: clamp(trailDistanceScale, .2, 1), widthScale, heightScale, lateralOffset, presentationOnly: true };
}
