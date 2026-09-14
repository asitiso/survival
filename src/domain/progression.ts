export function xpNeededForLevel(level: number): number {
  const l = Math.max(1, level);
  // Keep the existing long-run curve, but add a modest 10% delay between level-ups.
  const pacing = (2.1 + 0.5 * Math.max(0, 1 - (l - 1) / 29)) * 1.1;
  return Math.floor((20 + 9.5 * Math.pow(l, 1.25) + Math.max(0, l - 30) * 2.8) * pacing);
}

export function levelUpRecovery(hp: number, maxHp: number): number {
  return Math.max(0, Math.min(maxHp - hp, Math.floor(maxHp * 0.12)));
}

export function enemyXpValue(danger: number, base: number): number {
  return Math.max(1, Math.round(base * (1 + Math.max(0, danger - 1) * 0.09)));
}

export function dangerTierForSeconds(seconds: number): number {
  return 1 + Math.floor(Math.max(0, seconds) / 75);
}
