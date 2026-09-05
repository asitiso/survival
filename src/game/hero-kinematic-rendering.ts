import type { Vec2 } from '../core/math.js';

export interface HeroKinematicRenderState {
  speed: number;
  acceleration: number;
  deceleration: number;
  turn: number;
  settle: number;
  facingX: number;
  facingY: number;
}

export interface HeroKinematicRenderPresentation {
  accelerationLean: number;
  turnAnticipation: number;
  decelerationSettle: number;
  castFocus: number;
  leadX: number;
  leadY: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const wrapAngle = (value: number) => {
  let angle = value;
  while (angle > Math.PI) angle -= Math.PI * 2;
  while (angle < -Math.PI) angle += Math.PI * 2;
  return angle;
};

export function createHeroKinematicRenderState(facing: Vec2 = { x: 1, y: 0 }): HeroKinematicRenderState {
  const length = Math.hypot(facing.x, facing.y) || 1;
  return {
    speed: 0,
    acceleration: 0,
    deceleration: 0,
    turn: 0,
    settle: 0,
    facingX: facing.x / length,
    facingY: facing.y / length,
  };
}

export function advanceHeroKinematicRenderState(
  previous: HeroKinematicRenderState,
  move: Vec2,
  facing: Vec2,
  dt: number,
): HeroKinematicRenderState {
  const safeDt = Math.max(0, Math.min(0.1, Number.isFinite(dt) ? dt : 0));
  const targetSpeed = clamp(Math.hypot(move.x, move.y), 0, 1);
  const speedDelta = targetSpeed - previous.speed;
  const accelerationTarget = clamp(speedDelta / Math.max(0.016, safeDt || 0.016), 0, 6) / 6;
  const decelerationTarget = clamp(-speedDelta / Math.max(0.016, safeDt || 0.016), 0, 6) / 6;
  const speed = previous.speed + (targetSpeed - previous.speed) * Math.min(1, safeDt * (targetSpeed > previous.speed ? 11 : 7));
  const acceleration = previous.acceleration + (accelerationTarget - previous.acceleration) * Math.min(1, safeDt * 12);
  const deceleration = previous.deceleration + (decelerationTarget - previous.deceleration) * Math.min(1, safeDt * 9);

  const facingLength = Math.hypot(facing.x, facing.y) || 1;
  const nextFacingX = facing.x / facingLength;
  const nextFacingY = facing.y / facingLength;
  const previousAngle = Math.atan2(previous.facingY, previous.facingX);
  const nextAngle = Math.atan2(nextFacingY, nextFacingX);
  const turnTarget = clamp(wrapAngle(nextAngle - previousAngle) / 0.65, -1, 1) * Math.max(targetSpeed, speed);
  const turn = previous.turn + (turnTarget - previous.turn) * Math.min(1, safeDt * 10);
  const settleTarget = targetSpeed < 0.05 && previous.speed > 0.08 ? Math.max(previous.settle, previous.speed) : 0;
  const settle = settleTarget > 0
    ? Math.max(previous.settle, settleTarget)
    : Math.max(0, previous.settle - safeDt * 2.8);

  return {
    speed: clamp(speed, 0, 1),
    acceleration: clamp(acceleration, 0, 1),
    deceleration: clamp(deceleration, 0, 1),
    turn: clamp(turn, -1, 1),
    settle: clamp(settle, 0, 1),
    facingX: nextFacingX,
    facingY: nextFacingY,
  };
}

export function heroKinematicRenderPresentation(
  state: HeroKinematicRenderState,
  reducedMotion: boolean,
  castFocus = 0,
): HeroKinematicRenderPresentation {
  const motionScale = reducedMotion ? 0.38 : 1;
  const normalizedCast = clamp(castFocus, 0, 1);
  const castSuppression = 1 - normalizedCast * 0.7;
  const accelerationLean = state.acceleration * state.speed * motionScale * castSuppression;
  const turnAnticipation = state.turn * motionScale * (1 - normalizedCast * 0.55);
  const decelerationSettle = Math.max(state.deceleration * 0.7, state.settle) * motionScale * (1 - normalizedCast * 0.35);
  const lead = state.speed * (3.6 + accelerationLean * 4.2) * motionScale;
  return {
    accelerationLean,
    turnAnticipation,
    decelerationSettle,
    castFocus: normalizedCast,
    leadX: state.facingX * lead + state.facingY * turnAnticipation * 3.1,
    leadY: state.facingY * lead - decelerationSettle * 1.8,
    rotation: turnAnticipation * 0.16 + accelerationLean * 0.055 - decelerationSettle * 0.045,
    scaleX: 1 + accelerationLean * 0.035 + normalizedCast * 0.012,
    scaleY: 1 - accelerationLean * 0.025 + decelerationSettle * 0.02,
  };
}
