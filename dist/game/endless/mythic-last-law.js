import { clamp } from '../../core/math.js';
const NEUTRAL = {
    active: false,
    label: '',
    bossDamageTakenMultiplier: 1,
    specialCadenceMultiplier: 1,
    summonCountMultiplier: 1,
    dashDistanceMultiplier: 1,
    projectileDensityMultiplier: 1,
    rewardMultiplier: 1,
};
export function mythicLastLawProfile(profile, hpRatio, weakpointRatio) {
    if (!profile.active || clamp(hpRatio, 0, 1) > .15)
        return NEUTRAL;
    const remaining = clamp(weakpointRatio, 0, 1);
    const cleared = 1 - remaining;
    return {
        active: true,
        label: 'MYTHIC LAST LAW',
        bossDamageTakenMultiplier: clamp(.86 + cleared * .32, .84, 1.18),
        specialCadenceMultiplier: clamp(.69 + cleared * .29, .66, 1),
        summonCountMultiplier: clamp(1.19 - cleared * .28, .9, 1.2),
        dashDistanceMultiplier: clamp(1.21 - cleared * .2, .98, 1.22),
        projectileDensityMultiplier: clamp(1.31 - cleared * .28, 1.02, 1.32),
        rewardMultiplier: clamp(1.12 + cleared * .08, 1.12, 1.2),
    };
}
