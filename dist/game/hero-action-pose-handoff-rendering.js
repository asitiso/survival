const c = (v) => Math.max(0, Math.min(1, v));
export function heroActionPoseHandoffPresentation(input, reducedMotion = false) {
    const cast = c(input.cast), recovery = c(input.recovery), windup = c(input.ultimateWindup), release = c(input.ultimateRelease), ultimateRecovery = c(input.ultimateRecovery), hit = c(input.hit), ultimate = Math.max(windup, release, ultimateRecovery);
    let owner = 'movement', actionPoseScale = 0, castPoseScale = 0, ultimatePoseScale = 0, castOverlayScale = 0, recoverOverlayScale = 0, releaseCarry = 0;
    if (hit > .55) {
        owner = 'hit';
        actionPoseScale = .36 * (1 - hit * .55);
        castPoseScale = .18;
        ultimatePoseScale = .22;
        castOverlayScale = .22;
        recoverOverlayScale = .18;
    }
    else if (input.owner === 'ultimate' && ultimate > .06) {
        owner = 'ultimate';
        actionPoseScale = 1;
        castPoseScale = Math.min(.42, cast * (1 - ultimate * .72));
        ultimatePoseScale = 1;
        castOverlayScale = .42;
        recoverOverlayScale = .22;
    }
    else if (input.owner === 'cast' && cast > .06) {
        owner = 'cast';
        actionPoseScale = 1;
        castPoseScale = 1;
        ultimatePoseScale = 0;
        castOverlayScale = 1;
        recoverOverlayScale = .18;
    }
    else if (recovery > .06 || ultimateRecovery > .06) {
        owner = 'recovery';
        actionPoseScale = .48 + .22 * Math.max(recovery, ultimateRecovery);
        castPoseScale = .18;
        ultimatePoseScale = .18 * ultimateRecovery;
        castOverlayScale = .26;
        recoverOverlayScale = .88;
        releaseCarry = c(input.releaseAccent) * (1 - Math.max(recovery, ultimateRecovery)) * .46;
    }
    if (reducedMotion) {
        releaseCarry = 0;
        if (owner === 'ultimate') {
            castPoseScale = 0;
            castOverlayScale = .3;
        }
        if (owner === 'recovery')
            actionPoseScale = .42;
    }
    return { owner, actionPoseScale: c(actionPoseScale), castPoseScale: c(castPoseScale), ultimatePoseScale: c(ultimatePoseScale), castOverlayScale: c(castOverlayScale), recoverOverlayScale: c(recoverOverlayScale), releaseCarry: c(releaseCarry), singlePoseOwner: true, presentationOnly: true };
}
