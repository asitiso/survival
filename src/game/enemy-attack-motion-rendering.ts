export type EnemyAttackMotionType = 'grunt' | 'hound' | 'brute' | 'archer' | 'bomber' | 'shaman' | 'shieldbearer' | 'assassin' | 'siegeGolem' | 'nullifier' | 'golden' | 'elite' | 'boss';

export interface EnemyAttackMotionPresentation {
  active: boolean;
  pullback: number;
  lunge: number;
  facingAngle: number;
  rangedAim: boolean;
  weight: number;
  maxDisplacement: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const WEIGHT: Readonly<Record<EnemyAttackMotionType, number>> = {
  grunt: 0.8,
  hound: 0.62,
  brute: 1.25,
  archer: 0.7,
  bomber: 0.82,
  shaman: 0.9,
  shieldbearer: 1.12,
  assassin: 0.58,
  siegeGolem: 1.45,
  nullifier: 0.95,
  golden: 0.55,
  elite: 1.35,
  boss: 1.8,
};

const RANGED = new Set<EnemyAttackMotionType>(['archer', 'shaman', 'nullifier']);

export function enemyAttackMotionPresentation(
  type: EnemyAttackMotionType,
  attackTimer: number,
  attackInterval: number,
  targetDx: number,
  targetDy: number,
  inRange: boolean,
  reducedMotion = false,
): EnemyAttackMotionPresentation {
  const weight = WEIGHT[type];
  const rangedAim = RANGED.has(type);
  const facingAngle = Math.atan2(targetDy, targetDx);
  const maxDisplacement = clamp(9 / Math.max(0.55, weight), type === 'boss' ? 2.8 : 3.2, type === 'boss' ? 5 : type === 'elite' ? 6 : 10);
  if (!inRange || type === 'golden' || attackInterval <= 0 || !Number.isFinite(attackTimer)) {
    return { active:false, pullback:0, lunge:0, facingAngle, rangedAim, weight, maxDisplacement, offsetX:0, offsetY:0, rotation:0, scaleX:1, scaleY:1 };
  }

  const interval = Math.max(0.2, attackInterval);
  const remaining = clamp(attackTimer / interval, 0, 1);
  const cycle = 1 - remaining;
  const windup = clamp((cycle - 0.62) / 0.25, 0, 1);
  const strike = clamp((cycle - 0.87) / 0.13, 0, 1);
  const pullback = windup * (1 - strike) * (rangedAim ? 0.55 : 1);
  const lunge = strike * (rangedAim ? 0.35 : 1);
  const motionScale = reducedMotion ? 0.42 : 1;
  const signed = (-pullback * 0.72 + lunge) * maxDisplacement * motionScale;
  const dirX = Math.cos(facingAngle);
  const dirY = Math.sin(facingAngle);
  return {
    active: windup > 0.02 || strike > 0.02,
    pullback,
    lunge,
    facingAngle,
    rangedAim,
    weight,
    maxDisplacement,
    offsetX: dirX * signed,
    offsetY: dirY * signed,
    rotation: rangedAim ? 0 : (pullback - lunge) * 0.055 * motionScale / Math.max(0.7, weight),
    scaleX: 1 + lunge * 0.05 * motionScale - pullback * 0.025 * motionScale,
    scaleY: 1 - lunge * 0.035 * motionScale + pullback * 0.02 * motionScale,
  };
}
