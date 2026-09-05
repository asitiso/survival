const NEUTRAL = { healthMultiplier: 1, damageMultiplier: 1, rewardMultiplier: 1, initialSpecialTimerMultiplier: 1 };
const BASE = [
    { healthMultiplier: .92, damageMultiplier: .90, rewardMultiplier: 1.05, initialSpecialTimerMultiplier: 1.10 },
    { healthMultiplier: .96, damageMultiplier: .94, rewardMultiplier: 1.04, initialSpecialTimerMultiplier: 1.06 },
    { healthMultiplier: .99, damageMultiplier: .98, rewardMultiplier: 1.02, initialSpecialTimerMultiplier: 1.03 },
];
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function round(value) { return Math.round(value * 1000) / 1000; }
function towardNeutral(value, factor) { return round(1 + (value - 1) * factor); }
export function bossDifficultyCurve(bossOrdinal, _elapsedSeconds, threat) {
    const ordinal = Math.max(0, Math.floor(Number.isFinite(bossOrdinal) ? bossOrdinal : 0));
    if (ordinal >= BASE.length)
        return { ...NEUTRAL };
    const factor = 1 - clamp(Number.isFinite(threat) ? threat : 0, 0, 5) * .1;
    const base = BASE[ordinal];
    return {
        healthMultiplier: towardNeutral(base.healthMultiplier, factor),
        damageMultiplier: towardNeutral(base.damageMultiplier, factor),
        rewardMultiplier: towardNeutral(base.rewardMultiplier, factor),
        initialSpecialTimerMultiplier: towardNeutral(base.initialSpecialTimerMultiplier, factor),
    };
}
export function auditBossDifficultyCurve() {
    const profiles = [0, 1, 2, 3].map((ordinal) => bossDifficultyCurve(ordinal, (ordinal + 1) * 120, 0));
    const threatFiveProfiles = [0, 1, 2, 3].map((ordinal) => bossDifficultyCurve(ordinal, (ordinal + 1) * 120, 5));
    const eased = profiles.slice(0, 3);
    const monotonic = eased[0].healthMultiplier < eased[1].healthMultiplier && eased[1].healthMultiplier < eased[2].healthMultiplier && eased[0].damageMultiplier < eased[1].damageMultiplier && eased[1].damageMultiplier < eased[2].damageMultiplier && eased[0].initialSpecialTimerMultiplier > eased[1].initialSpecialTimerMultiplier && eased[1].initialSpecialTimerMultiplier > eased[2].initialSpecialTimerMultiplier;
    const bounded = [...profiles, ...threatFiveProfiles].every((p) => p.healthMultiplier >= .9 && p.healthMultiplier <= 1 && p.damageMultiplier >= .88 && p.damageMultiplier <= 1 && p.rewardMultiplier >= 1 && p.rewardMultiplier <= 1.05 && p.initialSpecialTimerMultiplier >= 1 && p.initialSpecialTimerMultiplier <= 1.1);
    const lateNeutral = JSON.stringify(profiles[3]) === JSON.stringify(NEUTRAL) && JSON.stringify(threatFiveProfiles[3]) === JSON.stringify(NEUTRAL);
    return { profiles, threatFiveProfiles, monotonic, bounded, lateNeutral, passed: monotonic && bounded && lateNeutral };
}
