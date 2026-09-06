const c = (v) => Math.max(0, Math.min(1, v));
export function bossAnticipationRecoveryHandoffPresentation(input, reducedMotion = false, reducedFlash = false) {
    const charge = c(input.charge), recovery = c(input.recovery), stagger = c(input.stagger);
    let owner = 'none', ringScale = 0, secondaryRingScale = 0, bodyScale = 0, alphaScale = reducedFlash ? .68 : 1;
    if (stagger > .5) {
        owner = 'stagger';
        ringScale = .32 * (1 - stagger * .35);
        secondaryRingScale = 0;
        bodyScale = .42 * (1 - stagger * .25);
    }
    else if (recovery > .12 && charge < .28) {
        owner = 'recovery';
        ringScale = .18 + .28 * (1 - recovery);
        secondaryRingScale = Math.min(.22, .12 * (1 - recovery));
        bodyScale = .42 + .28 * (1 - recovery);
    }
    else if (charge > .025) {
        owner = 'anticipation';
        ringScale = .78 + .22 * charge;
        secondaryRingScale = charge > .55 ? .72 + .2 * charge : 0;
        bodyScale = .72 + .28 * c(input.bodyStrength);
    }
    if (reducedMotion && owner === 'recovery') {
        ringScale = Math.min(ringScale, .28);
        bodyScale = Math.min(bodyScale, .5);
    }
    return { owner, ringScale: c(ringScale), secondaryRingScale: c(secondaryRingScale), bodyScale: c(bodyScale), alphaScale: c(alphaScale), presentationOnly: true };
}
