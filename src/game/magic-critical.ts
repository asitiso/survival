import type { Hero } from './entities.js';

const MAGIC_CRITICAL_MULTIPLIER = 1.5;

export function magicCriticalDamage(amount: number, hero: Pick<Hero, 'critChance'>, roll: () => number = Math.random): number {
  return roll() < hero.critChance ? amount * MAGIC_CRITICAL_MULTIPLIER : amount;
}
