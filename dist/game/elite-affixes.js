export const ELITE_AFFIXES = ['swift', 'armored', 'regenerating', 'frenzied', 'commander', 'manaShield'];
export function eliteAffixCount(danger) {
    return Math.max(1, danger) >= 7 ? 2 : 1;
}
export function selectEliteAffixes(danger, random = Math.random) {
    const count = eliteAffixCount(danger);
    const pool = [...ELITE_AFFIXES];
    const out = [];
    while (out.length < count && pool.length > 0) {
        const r = Math.max(0, Math.min(0.999999, random()));
        const index = Math.floor(r * pool.length);
        out.push(pool.splice(index, 1)[0]);
    }
    return out;
}
export function eliteAffixModifiers(affixes) {
    const out = {
        speedMultiplier: 1,
        attackIntervalMultiplier: 1,
        damageTakenMultiplier: 1,
        regenPerSecondRatio: 0,
        lowHpDamageMultiplier: 1,
        commandAuraMultiplier: 1,
        shieldRatio: 0,
    };
    for (const id of affixes) {
        if (id === 'swift') {
            out.speedMultiplier *= 1.28;
            out.attackIntervalMultiplier *= 0.78;
        }
        else if (id === 'armored')
            out.damageTakenMultiplier *= 0.68;
        else if (id === 'regenerating')
            out.regenPerSecondRatio += 0.018;
        else if (id === 'frenzied')
            out.lowHpDamageMultiplier *= 1.55;
        else if (id === 'commander')
            out.commandAuraMultiplier *= 1.18;
        else if (id === 'manaShield')
            out.shieldRatio += 0.36;
    }
    return out;
}
export function eliteAffixLabel(id) {
    if (id === 'swift')
        return '신속';
    if (id === 'armored')
        return '철갑';
    if (id === 'regenerating')
        return '재생';
    if (id === 'frenzied')
        return '폭주';
    if (id === 'commander')
        return '지휘';
    return '마흡';
}
