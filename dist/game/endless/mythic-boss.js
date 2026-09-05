import { clamp } from '../../core/math.js';
import { bossArchetypeForOrdinal } from '../boss-patterns.js';
function uniqueChannels(ordinal) {
    const channels = [];
    for (const offset of [0, 2, 4, 1, 3, 5]) {
        const channel = bossArchetypeForOrdinal(Math.max(0, ordinal) + offset);
        if (!channels.includes(channel))
            channels.push(channel);
        if (channels.length === 3)
            break;
    }
    return channels;
}
export function mythicBossProfile(elapsedSeconds, threatLevel, bossOrdinal) {
    const ordinal = Math.max(0, Math.floor(bossOrdinal));
    const active = elapsedSeconds >= 3600 && threatLevel >= 4 && ordinal % 4 === 3;
    if (!active)
        return { active: false, label: '', tier: 0, channels: [] };
    const hours = Math.max(1, Math.floor(elapsedSeconds / 3600));
    const tier = Math.min(5, 1 + Math.floor((hours - 1) / 1));
    return { active: true, label: `MYTHIC ${tier}`, tier, channels: uniqueChannels(ordinal) };
}
export function mythicPressureModifiers(profile) {
    if (!profile.active)
        return { healthMultiplier: 1, damageMultiplier: 1, specialCadenceMultiplier: 1, projectileDensityMultiplier: 1, summonCountMultiplier: 1, rewardMultiplier: 1 };
    const tier = clamp(profile.tier, 1, 5);
    return {
        healthMultiplier: clamp(1.32 + tier * .055, 1, 1.6),
        damageMultiplier: clamp(1.13 + tier * .04, 1, 1.4),
        specialCadenceMultiplier: clamp(.9 - tier * .025, .76, 1),
        projectileDensityMultiplier: clamp(1.14 + tier * .035, 1, 1.35),
        summonCountMultiplier: clamp(1.08 + tier * .02, 1, 1.18),
        rewardMultiplier: clamp(1.25 + tier * .12, 1, 1.85),
    };
}
