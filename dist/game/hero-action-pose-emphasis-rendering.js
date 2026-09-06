const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
export function heroActionPoseEmphasisPresentation(input, reducedMotion = false) {
    const cast = clamp(input.cast), recovery = clamp(input.recovery), windup = clamp(input.ultimateWindup), release = clamp(input.ultimateRelease), ultimateRecovery = clamp(input.ultimateRecovery), hit = clamp(input.hit);
    const ultimate = Math.max(windup, release, ultimateRecovery);
    const poseOwner = input.owner === 'ultimate' && ultimate > .04 ? 'ultimate' : input.owner === 'cast' && cast > .04 ? 'cast' : recovery > .04 ? 'recovery' : 'movement';
    const hitYield = 1 - hit * .62, motionScale = (reducedMotion ? .38 : 1) * hitYield;
    let rawStrength = 0, forwardLead = 0, lift = 0, rotation = 0, scaleX = 1, scaleY = 1, castOverlayAlphaScale = 1, recoverOverlayAlphaScale = 1, releaseAccentScale = 0;
    const len = Math.hypot(input.facingX, input.facingY) || 1, fx = input.facingX / len, fy = input.facingY / len;
    if (poseOwner === 'cast') {
        rawStrength = cast;
        forwardLead = 4.8 * cast;
        lift = 1.8 * cast;
        rotation = (fy - fx * .12) * .035 * cast;
        scaleX = 1 + .052 * cast;
        scaleY = 1 - .038 * cast;
        castOverlayAlphaScale = 1 + .12 * cast;
        recoverOverlayAlphaScale = .82;
    }
    else if (poseOwner === 'ultimate') {
        rawStrength = Math.max(windup, release, ultimateRecovery * .55);
        forwardLead = 3.2 * windup + 7.8 * release + 1.4 * ultimateRecovery;
        lift = 5.4 * windup + 2.1 * release + .8 * ultimateRecovery;
        rotation = (fy - fx * .16) * (.028 * windup - .018 * release);
        scaleX = 1 + .075 * windup + .105 * release + .018 * ultimateRecovery;
        scaleY = 1 + .045 * windup - .045 * release + .012 * ultimateRecovery;
        castOverlayAlphaScale = .72 + .22 * windup;
        recoverOverlayAlphaScale = .55 + .28 * ultimateRecovery;
        releaseAccentScale = clamp(.42 * windup + 1.12 * release);
    }
    else if (poseOwner === 'recovery') {
        rawStrength = recovery * .48;
        forwardLead = 1.4 * recovery;
        lift = .7 * recovery;
        rotation = -fy * .012 * recovery;
        scaleX = 1 + .012 * recovery;
        scaleY = 1 - .01 * recovery;
        castOverlayAlphaScale = .42;
        recoverOverlayAlphaScale = .82 + .12 * recovery;
    }
    const poseStrength = clamp(rawStrength * hitYield);
    forwardLead *= motionScale;
    lift *= motionScale;
    rotation *= motionScale;
    scaleX = 1 + (scaleX - 1) * motionScale;
    scaleY = 1 + (scaleY - 1) * motionScale;
    castOverlayAlphaScale *= 1 - hit * .38;
    recoverOverlayAlphaScale *= 1 - hit * .28;
    releaseAccentScale *= hitYield;
    return { poseOwner, poseStrength, forwardLead, lift, rotation, scaleX, scaleY, castOverlayAlphaScale: clamp(castOverlayAlphaScale, 0, 1.2), recoverOverlayAlphaScale: clamp(recoverOverlayAlphaScale, 0, 1.1), releaseAccentScale: clamp(releaseAccentScale), presentationOnly: true };
}
