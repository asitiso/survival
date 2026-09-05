import type { Vec2 } from '../core/math.js';

export type SpecialistEnemyType = 'shieldbearer' | 'assassin' | 'siegeGolem' | 'nullifier';
export type SpecialistTarget = 'hero' | 'core';


export const SPECIALIST_COMBAT_CONTRACT = {
  bomberBlastRadius: 82,
  shieldGuardRatio: 0.45,
  assassinBlinkResetSeconds: 4.2,
  assassinInitialBaseSeconds: 3.2,
  assassinInitialRandomSeconds: 1.5,
  shamanHealRadius: 220,
  shamanHealMinimum: 10,
  shamanHealRatio: 0.10,
  nullifierEffectRadius: 245,
  nullifierCooldownStep: 0.08,
  nullifierCooldownCap: 1.24,
} as const;

export interface NullifierLike {
  alive: boolean;
  type: string;
  pos: Vec2;
  radius: number;
}

export function specialistTarget(type: SpecialistEnemyType): SpecialistTarget {
  return type === 'siegeGolem' ? 'core' : 'hero';
}

export function selectSpecialistEnemyType(seconds: number, roll: number): SpecialistEnemyType | null {
  const r = Math.max(0, Math.min(0.999999, roll));
  if (seconds < 300) return null;
  if (r < 0.03) return 'shieldbearer';
  if (seconds >= 360 && r < 0.065) return 'assassin';
  if (seconds >= 420 && r < 0.095) return 'siegeGolem';
  if (seconds >= 480 && r < 0.125) return 'nullifier';
  return null;
}

export function assassinBlinkPosition(from: Vec2, hero: Vec2): Vec2 {
  const dx = from.x - hero.x;
  const dy = from.y - hero.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const distance = 90;
  return { x: hero.x + dx / length * distance, y: hero.y + dy / length * distance };
}

export function nullifierCooldownMultiplier(enemies: readonly NullifierLike[], heroPos: Vec2): number {
  let nearby = 0;
  for (const enemy of enemies) {
    if (!enemy.alive || enemy.type !== 'nullifier') continue;
    if (Math.hypot(enemy.pos.x - heroPos.x, enemy.pos.y - heroPos.y) <= SPECIALIST_COMBAT_CONTRACT.nullifierEffectRadius + enemy.radius) nearby += 1;
  }
  return Math.min(SPECIALIST_COMBAT_CONTRACT.nullifierCooldownCap, 1 + nearby * SPECIALIST_COMBAT_CONTRACT.nullifierCooldownStep);
}
