export function bossPhaseForRatio(hpRatio) {
    const ratio = Math.max(0, Math.min(1, hpRatio));
    if (ratio > 0.66)
        return 1;
    if (ratio > 0.33)
        return 2;
    return 3;
}
export function bossPatternTuning(phase) {
    if (phase === 1)
        return { specialInterval: 5.8, fanProjectiles: 5, fanSpread: 0.82, summonCount: 0, speedMultiplier: 1 };
    if (phase === 2)
        return { specialInterval: 5.0, fanProjectiles: 6, fanSpread: 1.00, summonCount: 3, speedMultiplier: 1.10 };
    return { specialInterval: 3.8, fanProjectiles: 8, fanSpread: 1.16, summonCount: 2, speedMultiplier: 1.35 };
}
const ARCHETYPES = ['inferno', 'summoner', 'juggernaut', 'abyssWitch', 'twinMaw', 'timeEater'];
export function bossArchetypeForOrdinal(ordinal) {
    return ARCHETYPES[Math.max(0, Math.floor(ordinal)) % ARCHETYPES.length];
}
export function bossArchetypeSpecial(archetype, phase) {
    if (archetype === 'abyssWitch')
        return { curseZones: phase, secondaryFanAngle: 0, cooldownPressureMultiplier: 1, cooldownPressureDuration: 0 };
    if (archetype === 'twinMaw')
        return { curseZones: 0, secondaryFanAngle: 0.82 + phase * 0.12, cooldownPressureMultiplier: 1, cooldownPressureDuration: 0 };
    if (archetype === 'timeEater')
        return { curseZones: 0, secondaryFanAngle: 0, cooldownPressureMultiplier: 1.08 + phase * 0.05, cooldownPressureDuration: 2.4 + phase * 0.5 };
    return { curseZones: 0, secondaryFanAngle: 0, cooldownPressureMultiplier: 1, cooldownPressureDuration: 0 };
}
export function bossArchetypeTuning(archetype, phase) {
    if (archetype === 'inferno') {
        if (phase === 1)
            return { specialInterval: 5.4, fanProjectiles: 7, fanSpread: 0.94, summonCount: 0, speedMultiplier: 1.00, ringProjectiles: 0, dashDistance: 0, projectileSpeedMultiplier: 1.08, telegraphColor: '#ff934f', bodyColor: '#ff5d45' };
        if (phase === 2)
            return { specialInterval: 4.6, fanProjectiles: 8, fanSpread: 1.10, summonCount: 1, speedMultiplier: 1.10, ringProjectiles: 8, dashDistance: 0, projectileSpeedMultiplier: 1.15, telegraphColor: '#ff793f', bodyColor: '#ff493d' };
        return { specialInterval: 3.5, fanProjectiles: 11, fanSpread: 1.28, summonCount: 1, speedMultiplier: 1.30, ringProjectiles: 12, dashDistance: 0, projectileSpeedMultiplier: 1.24, telegraphColor: '#ff5d36', bodyColor: '#ff303c' };
    }
    if (archetype === 'summoner') {
        if (phase === 1)
            return { specialInterval: 5.8, fanProjectiles: 3, fanSpread: 0.72, summonCount: 3, speedMultiplier: 0.96, ringProjectiles: 0, dashDistance: 0, projectileSpeedMultiplier: 0.95, telegraphColor: '#83f0aa', bodyColor: '#7b71d9' };
        if (phase === 2)
            return { specialInterval: 4.9, fanProjectiles: 4, fanSpread: 0.84, summonCount: 5, speedMultiplier: 1.04, ringProjectiles: 0, dashDistance: 0, projectileSpeedMultiplier: 0.98, telegraphColor: '#6ee5a4', bodyColor: '#6b65cf' };
        return { specialInterval: 4.0, fanProjectiles: 5, fanSpread: 0.92, summonCount: 7, speedMultiplier: 1.12, ringProjectiles: 6, dashDistance: 0, projectileSpeedMultiplier: 1.03, telegraphColor: '#51d990', bodyColor: '#5d56c5' };
    }
    if (archetype === 'juggernaut') {
        if (phase === 1)
            return { specialInterval: 5.2, fanProjectiles: 4, fanSpread: 0.72, summonCount: 0, speedMultiplier: 1.16, ringProjectiles: 0, dashDistance: 120, projectileSpeedMultiplier: 1.00, telegraphColor: '#ffd36a', bodyColor: '#ba7445' };
        if (phase === 2)
            return { specialInterval: 4.3, fanProjectiles: 5, fanSpread: 0.82, summonCount: 0, speedMultiplier: 1.34, ringProjectiles: 6, dashDistance: 160, projectileSpeedMultiplier: 1.05, telegraphColor: '#ffc34f', bodyColor: '#ad633f' };
        return { specialInterval: 3.3, fanProjectiles: 6, fanSpread: 0.90, summonCount: 1, speedMultiplier: 1.58, ringProjectiles: 8, dashDistance: 205, projectileSpeedMultiplier: 1.10, telegraphColor: '#ffad3d', bodyColor: '#9e5038' };
    }
    if (archetype === 'abyssWitch') {
        if (phase === 1)
            return { specialInterval: 5.6, fanProjectiles: 4, fanSpread: 0.78, summonCount: 0, speedMultiplier: 0.94, ringProjectiles: 4, dashDistance: 0, projectileSpeedMultiplier: 0.92, telegraphColor: '#d982ff', bodyColor: '#7f4eaa' };
        if (phase === 2)
            return { specialInterval: 4.6, fanProjectiles: 5, fanSpread: 0.92, summonCount: 1, speedMultiplier: 1.02, ringProjectiles: 6, dashDistance: 0, projectileSpeedMultiplier: 0.98, telegraphColor: '#ca68ff', bodyColor: '#713f9b' };
        return { specialInterval: 3.6, fanProjectiles: 7, fanSpread: 1.04, summonCount: 2, speedMultiplier: 1.12, ringProjectiles: 9, dashDistance: 0, projectileSpeedMultiplier: 1.04, telegraphColor: '#b94fff', bodyColor: '#64338f' };
    }
    if (archetype === 'twinMaw') {
        if (phase === 1)
            return { specialInterval: 5.0, fanProjectiles: 5, fanSpread: 0.68, summonCount: 0, speedMultiplier: 1.10, ringProjectiles: 0, dashDistance: 55, projectileSpeedMultiplier: 1.08, telegraphColor: '#ff7fb6', bodyColor: '#a84d6f' };
        if (phase === 2)
            return { specialInterval: 4.1, fanProjectiles: 6, fanSpread: 0.78, summonCount: 0, speedMultiplier: 1.20, ringProjectiles: 4, dashDistance: 75, projectileSpeedMultiplier: 1.14, telegraphColor: '#ff679f', bodyColor: '#983f62' };
        return { specialInterval: 3.2, fanProjectiles: 8, fanSpread: 0.90, summonCount: 1, speedMultiplier: 1.34, ringProjectiles: 6, dashDistance: 95, projectileSpeedMultiplier: 1.20, telegraphColor: '#ff4d8b', bodyColor: '#873552' };
    }
    if (phase === 1)
        return { specialInterval: 5.7, fanProjectiles: 4, fanSpread: 0.82, summonCount: 0, speedMultiplier: 1.00, ringProjectiles: 4, dashDistance: 0, projectileSpeedMultiplier: 0.94, telegraphColor: '#77d7ff', bodyColor: '#4d7da3' };
    if (phase === 2)
        return { specialInterval: 4.7, fanProjectiles: 5, fanSpread: 0.94, summonCount: 1, speedMultiplier: 1.08, ringProjectiles: 6, dashDistance: 0, projectileSpeedMultiplier: 1.00, telegraphColor: '#60c9ff', bodyColor: '#416d95' };
    return { specialInterval: 3.6, fanProjectiles: 7, fanSpread: 1.06, summonCount: 1, speedMultiplier: 1.18, ringProjectiles: 8, dashDistance: 0, projectileSpeedMultiplier: 1.08, telegraphColor: '#47b8ff', bodyColor: '#365f89' };
}
export function bossVariantTierForOrdinal(ordinal, bonus = 0) {
    return Math.min(2, Math.floor(Math.max(0, ordinal) / 6) + Math.max(0, Math.floor(bonus)));
}
export function bossVariantTuning(base, tier) {
    if (tier === 0)
        return { ...base };
    const factor = tier === 1 ? 0.90 : 0.80;
    return {
        ...base,
        specialInterval: Math.max(2.5, base.specialInterval * factor),
        fanProjectiles: base.fanProjectiles + tier * 2,
        ringProjectiles: base.ringProjectiles + tier * 2,
        summonCount: base.summonCount + tier,
        speedMultiplier: base.speedMultiplier * (1 + tier * 0.06),
        dashDistance: base.dashDistance + tier * 30,
        projectileSpeedMultiplier: base.projectileSpeedMultiplier * (1 + tier * 0.07),
    };
}
export function bossVariantLabel(tier) { return tier === 0 ? '원형' : tier === 1 ? '강화' : '극한'; }
