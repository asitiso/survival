import { clamp } from '../../core/math.js';
import { mythicLastLawProfile } from './mythic-last-law.js';
const BIASES = {
    inferno: { lawId: 'solar-rupture', label: 'LAST LAW · SOLAR RUPTURE', accent: '#ff6d42', bossDamageTaken: 1.03, cadence: .98, summon: .96, dash: .96, projectile: 1.08 },
    summoner: { lawId: 'brood-crown', label: 'LAST LAW · BROOD CROWN', accent: '#79efa8', bossDamageTaken: 1.01, cadence: .97, summon: 1.12, dash: .92, projectile: .98 },
    juggernaut: { lawId: 'iron-verdict', label: 'LAST LAW · IRON VERDICT', accent: '#ffd06b', bossDamageTaken: .98, cadence: 1.00, summon: .9, dash: 1.14, projectile: .9 },
    abyssWitch: { lawId: 'null-eclipse', label: 'LAST LAW · NULL ECLIPSE', accent: '#cf72ff', bossDamageTaken: .99, cadence: .91, summon: 1.00, dash: .94, projectile: 1.06 },
    twinMaw: { lawId: 'twin-cataclysm', label: 'LAST LAW · TWIN CATACLYSM', accent: '#ff6fa7', bossDamageTaken: 1.00, cadence: .95, summon: .95, dash: 1.06, projectile: 1.06 },
    timeEater: { lawId: 'broken-hour', label: 'LAST LAW · BROKEN HOUR', accent: '#62caff', bossDamageTaken: 1.02, cadence: .87, summon: .88, dash: .98, projectile: 1.03 },
};
export function mythicLastLawIdentityProfile(profile, archetype, hpRatio, weakpointRatio) {
    const base = mythicLastLawProfile(profile, hpRatio, weakpointRatio);
    if (!base.active)
        return { ...base, lawId: 'none', accent: '#ffffff' };
    const bias = BIASES[archetype];
    return {
        ...base,
        lawId: bias.lawId,
        label: bias.label,
        accent: bias.accent,
        bossDamageTakenMultiplier: clamp(base.bossDamageTakenMultiplier * bias.bossDamageTaken, .7, 1.85),
        specialCadenceMultiplier: clamp(base.specialCadenceMultiplier * bias.cadence, .62, 1.05),
        summonCountMultiplier: clamp(base.summonCountMultiplier * bias.summon, .72, 1.55),
        dashDistanceMultiplier: clamp(base.dashDistanceMultiplier * bias.dash, .82, 1.55),
        projectileDensityMultiplier: clamp(base.projectileDensityMultiplier * bias.projectile, .9, 1.45),
        rewardMultiplier: clamp(base.rewardMultiplier, 1, 1.25),
    };
}
