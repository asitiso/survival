const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export function bossLocomotionWeightPresentation(phase, motionBlend, recovery, turn, reducedMotion = false) {
    const motion = clamp(motionBlend, 0, 1), recover = clamp(recovery, 0, 1), turnInput = clamp(turn, -1, 1);
    const phaseWeight = phase === 3 ? 1.45 : phase === 2 ? 1.22 : 1;
    const motionScale = reducedMotion ? .42 : 1;
    const settle = clamp(recover * (1 - motion * .62) * phaseWeight, 0, 1);
    const turnWeight = phaseWeight * (1 + motion * .18);
    const rotation = turnInput * .052 * motionScale / turnWeight;
    const showContactPulse = settle > .62 && motion < .2;
    const contactAlpha = showContactPulse ? Math.min(.24, .11 + settle * .11) : 0;
    const contactRadius = (44 + phase * 8 + settle * 14) * (reducedMotion ? .82 : 1);
    return { phase, turnWeight, settle, offsetY: clamp(settle * 3.8 * motionScale, 0, 5), rotation, showContactPulse, contactAlpha, contactRadius, shadowBoost: settle * (phase === 3 ? .24 : phase === 2 ? .18 : .13) };
}
