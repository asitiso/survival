export function objectiveMarkerMotionPolicy(input) {
    const reducedMotion = input.reducedMotion ?? input.reducedFlash;
    const animated = input.active && input.combatPrimary === 'normal' && !reducedMotion;
    return { animated, motionAmplitude: animated ? 0.05 : 0 };
}
