export function xpNeededForLevel(level) {
    const l = Math.max(1, level);
    // Give opening combat more breathing room; taper the increase for long runs.
    const pacing = 2.1 + 0.5 * Math.max(0, 1 - (l - 1) / 29);
    return Math.floor((20 + 9.5 * Math.pow(l, 1.25) + Math.max(0, l - 30) * 2.8) * pacing);
}
export function levelUpRecovery(hp, maxHp) {
    return Math.max(0, Math.min(maxHp - hp, Math.floor(maxHp * 0.12)));
}
export function enemyXpValue(danger, base) {
    return Math.max(1, Math.round(base * (1 + Math.max(0, danger - 1) * 0.09)));
}
export function dangerTierForSeconds(seconds) {
    return 1 + Math.floor(Math.max(0, seconds) / 75);
}
