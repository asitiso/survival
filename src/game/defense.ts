export function armorDamageTakenMultiplier(armor: number): number {
  const boundedArmor = Math.max(0, armor);
  return 20 / (20 + boundedArmor);
}
