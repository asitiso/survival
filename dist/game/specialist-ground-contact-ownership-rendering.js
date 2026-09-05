const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export function specialistGroundContactOwnershipPresentation(type, input, reducedMotion = false) {
    if (input.fatal)
        return { owner: 'fatal', locomotionScale: 0, turnStopScale: 0, shadowOffsetScale: 0, groundPulseScale: 0, groundFollowX: 0 };
    const motion = clamp(input.motion, 0, 1), attack = clamp(input.attackCommitment, 0, 1), hit = clamp(input.hitStagger, 0, 1), anchor = clamp(input.groundAnchor, 0, 1);
    let owner = 'neutral';
    if (attack >= .24)
        owner = 'attack';
    else if (hit > .08)
        owner = 'reaction';
    else if (motion > .08 || anchor > .08)
        owner = 'locomotion';
    let locomotionScale = 1, turnStopScale = 1, shadowOffsetScale = 1, groundPulseScale = 1, groundFollowX = 0;
    if (owner === 'attack') {
        locomotionScale = clamp(1 - attack * .72, .25, .78);
        turnStopScale = clamp(1 - attack * .64, .3, .8);
        shadowOffsetScale = clamp(1 - attack * .78, .18, .6);
        groundPulseScale = (type === 'siegeGolem' || type === 'shieldbearer') ? .86 : .46;
        groundFollowX = clamp(input.attackOffsetX * (.18 + attack * .12), -3.2, 3.2);
    }
    else if (owner === 'reaction') {
        locomotionScale = .46;
        turnStopScale = .54;
        shadowOffsetScale = .34;
        groundPulseScale = .55;
        groundFollowX = clamp(input.hitOffsetX * .22, -2.2, 2.2);
    }
    if (reducedMotion) {
        locomotionScale *= .84;
        turnStopScale *= .84;
        shadowOffsetScale *= .78;
        groundFollowX *= .55;
    }
    return { owner, locomotionScale: clamp(locomotionScale, 0, 1), turnStopScale: clamp(turnStopScale, 0, 1), shadowOffsetScale: clamp(shadowOffsetScale, 0, 1), groundPulseScale: clamp(groundPulseScale, 0, 1), groundFollowX };
}
