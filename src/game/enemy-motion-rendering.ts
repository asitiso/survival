export type EnemyMotionRenderType = 'grunt' | 'hound' | 'brute' | 'archer' | 'bomber' | 'shaman' | 'shieldbearer' | 'assassin' | 'siegeGolem' | 'nullifier' | 'golden' | 'elite' | 'boss';

export interface EnemyMotionRenderState {
  motionBlend: number;
  stride: number;
  facingX: number;
  facingY: number;
  turn: number;
  recovery: number;
}

export interface EnemyMotionRenderPresentation {
  moving: boolean;
  shadowWidth: number;
  shadowHeight: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  bob: number;
  leadX: number;
  leadY: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  silhouetteAlpha: number;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const wrapAngle = (value: number) => {
  let angle = value;
  while (angle > Math.PI) angle -= Math.PI * 2;
  while (angle < -Math.PI) angle += Math.PI * 2;
  return angle;
};

const MOBILITY_WEIGHT: Readonly<Record<EnemyMotionRenderType, number>> = {
  grunt: 0.72,
  hound: 1,
  brute: 0.48,
  archer: 0.58,
  bomber: 0.82,
  shaman: 0.44,
  shieldbearer: 0.42,
  assassin: 0.94,
  siegeGolem: 0.34,
  nullifier: 0.4,
  golden: 1,
  elite: 0.64,
  boss: 0.36,
};

export function advanceEnemyMotionRenderState(
  state: EnemyMotionRenderState | undefined,
  dx: number,
  dy: number,
  dt: number,
  radius: number,
): EnemyMotionRenderState {
  const prev = state ?? { motionBlend: 0, stride: 0, facingX: 1, facingY: 0, turn: 0, recovery: 0 };
  const distance = Math.hypot(dx, dy);
  const moving = distance > 0.01;
  const facingX = moving ? dx / Math.max(distance, 0.0001) : prev.facingX;
  const facingY = moving ? dy / Math.max(distance, 0.0001) : prev.facingY;
  const speedUnit = clamp(distance / Math.max(1, radius * 0.9), 0, 1);
  const motionTarget = moving ? speedUnit : 0;
  const easing = Math.min(1, Math.max(0.05, dt * (moving ? 11 : 7)));
  const motionBlend = clamp(prev.motionBlend + (motionTarget - prev.motionBlend) * easing, 0, 1);
  const stride = (prev.stride + dt * (2.5 + motionBlend * 7.5)) % (Math.PI * 2);
  const prevAngle = Math.atan2(prev.facingY, prev.facingX);
  const nextAngle = Math.atan2(facingY, facingX);
  const turnTarget = moving ? clamp(wrapAngle(nextAngle - prevAngle) / 0.8, -1, 1) * motionBlend : 0;
  const turn = prev.turn + (turnTarget - prev.turn) * Math.min(1, dt * (moving ? 8 : 6));
  let recovery = prev.recovery;
  if (!moving && prev.motionBlend > 0.12) recovery = Math.max(recovery, prev.motionBlend);
  recovery = Math.max(0, recovery - dt * 2.4);
  return { motionBlend, stride, facingX, facingY, turn, recovery };
}

export function enemyMotionRenderPresentation(
  type: EnemyMotionRenderType,
  radius: number,
  state: EnemyMotionRenderState | undefined,
  reducedMotion = false,
): EnemyMotionRenderPresentation {
  const current = state ?? { motionBlend: 0, stride: 0, facingX: 1, facingY: 0, turn: 0, recovery: 0 };
  const mobility = MOBILITY_WEIGHT[type];
  const motion = reducedMotion ? current.motionBlend * 0.45 : current.motionBlend;
  const bobScale = reducedMotion ? 0.35 : 1;
  const bob = Math.sin(current.stride) * (0.6 + mobility * 1.8 + motion * 1.2) * bobScale;
  const lead = (2.5 + radius * 0.08) * motion * (0.55 + mobility * 0.65);
  const recoveryPull = current.recovery * (reducedMotion ? 0.8 : 1.5);
  const leadX = current.facingX * lead - current.facingX * recoveryPull * 0.4 + current.facingY * current.turn * 1.6;
  const leadY = current.facingY * lead - recoveryPull * 0.6;
  const shadowWidth = radius * (1.12 + motion * (0.28 + mobility * 0.1));
  const shadowHeight = radius * (0.48 + motion * 0.06);
  return {
    moving: motion > 0.08,
    shadowWidth,
    shadowHeight,
    shadowOffsetX: current.facingX * motion * 2.2,
    shadowOffsetY: motion * 1.2,
    bob,
    leadX,
    leadY,
    rotation: current.turn * (reducedMotion ? 0.08 : 0.16),
    scaleX: 1 + motion * 0.045,
    scaleY: 1 - motion * 0.035,
    silhouetteAlpha: clamp(motion * (type === 'elite' || type === 'boss' || type === 'shieldbearer' || type === 'assassin' || type === 'nullifier' ? 0.32 : 0.22), 0, reducedMotion ? 0.18 : 0.26),
  };
}
