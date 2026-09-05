import type { Vec2 } from './math.js';

export interface JoystickNeutralRecoveryProfile {
  maxReach: number;
  catchRadius: number;
  minBaseShift: number;
}

export function joystickNeutralRecoveryProfile(maxReach = 92): JoystickNeutralRecoveryProfile {
  const reach = Number.isFinite(maxReach) && maxReach > 0 ? maxReach : 92;
  return {
    maxReach: reach,
    catchRadius: reach * 0.24,
    minBaseShift: reach * 0.18,
  };
}

export function shouldCatchJoystickNeutralReturn(
  home: Vec2,
  base: Vec2,
  pointer: Vec2,
  profile: JoystickNeutralRecoveryProfile = joystickNeutralRecoveryProfile(),
): boolean {
  const baseShift = Math.hypot(base.x - home.x, base.y - home.y);
  if (baseShift + Number.EPSILON < profile.minBaseShift) return false;
  const homeDistance = Math.hypot(pointer.x - home.x, pointer.y - home.y);
  return homeDistance <= profile.catchRadius + Number.EPSILON;
}
