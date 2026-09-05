export function composeHeroMeterCombat(base, meter) {
    if (meter.spellPowerMultiplier === 1 && meter.cooldownMultiplier === 1 && meter.areaMultiplier === 1 &&
        meter.coreDamageTakenMultiplier === 1 && meter.arkanExplosionChanceBonus === 0 && meter.arkanExplosionRadiusMultiplier === 1)
        return base;
    return {
        ...base,
        spellPowerMultiplier: base.spellPowerMultiplier * meter.spellPowerMultiplier,
        cooldownMultiplier: base.cooldownMultiplier * meter.cooldownMultiplier,
        areaMultiplier: base.areaMultiplier * meter.areaMultiplier,
        coreDamageTakenMultiplier: base.coreDamageTakenMultiplier * meter.coreDamageTakenMultiplier,
        arkanExplosionChanceBonus: base.arkanExplosionChanceBonus + meter.arkanExplosionChanceBonus,
        arkanExplosionRadiusMultiplier: base.arkanExplosionRadiusMultiplier * meter.arkanExplosionRadiusMultiplier,
    };
}
export function heroMeterCastSignals(heroId, action) {
    if (heroId === 'arkan')
        return { casts: 1 };
    if (heroId === 'seria') {
        if (action === 'spell3')
            return { chilledHits: 5 };
        if (action === 'spell4')
            return { chilledHits: 3 };
        if (action === 'ultimate1' || action === 'ultimate2')
            return { chilledHits: 6 };
        return { chilledHits: 1 };
    }
    if (heroId === 'kain')
        return { casts: 1 };
    return {};
}
export function heroMeterKillSignals(heroId, death) {
    if (heroId === 'arkan')
        return { kills: 1 };
    if (heroId === 'seria' && death.wasSlowed)
        return { frozenKills: 1 };
    return {};
}
