export function joystickNeutralRecoveryProfile(maxReach = 92) {
    const reach = Number.isFinite(maxReach) && maxReach > 0 ? maxReach : 92;
    return {
        maxReach: reach,
        catchRadius: reach * 0.24,
        minBaseShift: reach * 0.18,
    };
}
export function shouldCatchJoystickNeutralReturn(home, base, pointer, profile = joystickNeutralRecoveryProfile()) {
    const baseShift = Math.hypot(base.x - home.x, base.y - home.y);
    if (baseShift + Number.EPSILON < profile.minBaseShift)
        return false;
    const homeDistance = Math.hypot(pointer.x - home.x, pointer.y - home.y);
    return homeDistance <= profile.catchRadius + Number.EPSILON;
}
