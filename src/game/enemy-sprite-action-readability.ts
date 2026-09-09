export type EnemySpriteActionType =
  | 'grunt' | 'hound' | 'brute' | 'archer' | 'bomber' | 'shaman'
  | 'shieldbearer' | 'assassin' | 'siegeGolem' | 'nullifier' | 'golden'
  | 'elite' | 'boss';

export interface EnemySpriteActionInput {
  motionBlend: number;
  stride: number;
  facingX: number;
  facingY: number;
  turn: number;
  pullback: number;
  lunge: number;
  hitStagger: number;
  hitOffsetX: number;
  hitOffsetY: number;
}

export interface EnemySpriteActionPresentation {
  offsetX: number;
  offsetY: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

interface ActionProfile {
  mobility: number;
  attack: number;
  hit: number;
  offsetCap: number;
  rotationCap: number;
}

const PROFILE: Readonly<Record<EnemySpriteActionType, ActionProfile>> = {
  grunt: { mobility: .66, attack: .72, hit: .72, offsetCap: 4.0, rotationCap: .075 },
  hound: { mobility: 1.0, attack: .92, hit: .88, offsetCap: 5.0, rotationCap: .09 },
  brute: { mobility: .42, attack: .72, hit: .58, offsetCap: 3.6, rotationCap: .055 },
  archer: { mobility: .72, attack: .68, hit: .7, offsetCap: 4.0, rotationCap: .072 },
  bomber: { mobility: .8, attack: .78, hit: .76, offsetCap: 4.4, rotationCap: .08 },
  shaman: { mobility: .52, attack: .58, hit: .62, offsetCap: 3.6, rotationCap: .06 },
  shieldbearer: { mobility: .4, attack: .62, hit: .52, offsetCap: 3.2, rotationCap: .05 },
  assassin: { mobility: 1.0, attack: 1.0, hit: .92, offsetCap: 5.2, rotationCap: .095 },
  siegeGolem: { mobility: .28, attack: .52, hit: .42, offsetCap: 2.8, rotationCap: .04 },
  nullifier: { mobility: .48, attack: .54, hit: .58, offsetCap: 3.4, rotationCap: .055 },
  golden: { mobility: 1.0, attack: .42, hit: .76, offsetCap: 4.8, rotationCap: .085 },
  elite: { mobility: .7, attack: .84, hit: .8, offsetCap: 4.4, rotationCap: .075 },
  boss: { mobility: .2, attack: .3, hit: .28, offsetCap: 2.2, rotationCap: .032 },
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const finite = (value: number, fallback = 0) => Number.isFinite(value) ? value : fallback;

export function enemySpriteActionPresentation(
  type: EnemySpriteActionType,
  input: EnemySpriteActionInput,
  reducedMotion = false,
): EnemySpriteActionPresentation {
  const profile = PROFILE[type];
  const motion = clamp(finite(input.motionBlend), 0, 1);
  const pullback = clamp(finite(input.pullback), 0, 1);
  const lunge = clamp(finite(input.lunge), 0, 1);
  const hit = clamp(finite(input.hitStagger), 0, 1);
  const facingLength = Math.hypot(finite(input.facingX, 1), finite(input.facingY));
  const facingX = facingLength > .001 ? finite(input.facingX, 1) / facingLength : 1;
  const facingY = facingLength > .001 ? finite(input.facingY) / facingLength : 0;
  const strideWave = Math.sin(finite(input.stride));
  const strideAbs = Math.abs(strideWave);

  const locomotionTravel = strideWave * motion * 1.15 * profile.mobility;
  const attackTravel = (lunge * 3.0 - pullback * 1.85) * profile.attack;
  const hitOffsetX = finite(input.hitOffsetX) * .18 * hit * profile.hit;
  const hitOffsetY = finite(input.hitOffsetY) * .18 * hit * profile.hit;

  let offsetX = facingX * (locomotionTravel + attackTravel) + hitOffsetX;
  let offsetY = facingY * (locomotionTravel + attackTravel) + hitOffsetY - strideAbs * motion * .28 * profile.mobility;
  const offsetLength = Math.hypot(offsetX, offsetY);
  if (offsetLength > profile.offsetCap) {
    const capScale = profile.offsetCap / offsetLength;
    offsetX *= capScale;
    offsetY *= capScale;
  }

  const hitTilt = (finite(input.hitOffsetY) - finite(input.hitOffsetX) * .45) * .018 * hit * profile.hit;
  let rotation = finite(input.turn) * .05 * motion * profile.mobility
    + strideWave * motion * .012 * profile.mobility
    + (pullback - lunge) * .026 * profile.attack
    + hitTilt;
  rotation = clamp(rotation, -profile.rotationCap, profile.rotationCap);

  let scaleXDelta = strideAbs * motion * .018 * profile.mobility
    - pullback * .012 * profile.attack
    + lunge * .05 * profile.attack
    + hit * .035 * profile.hit;
  let scaleYDelta = -strideAbs * motion * .026 * profile.mobility
    + pullback * .038 * profile.attack
    - lunge * .042 * profile.attack
    - hit * .046 * profile.hit;

  const motionScale = reducedMotion ? .4 : 1;
  offsetX *= motionScale;
  offsetY *= motionScale;
  rotation *= motionScale;
  scaleXDelta *= motionScale;
  scaleYDelta *= motionScale;

  return {
    offsetX,
    offsetY,
    rotation,
    scaleX: 1 + scaleXDelta,
    scaleY: 1 + scaleYDelta,
  };
}
