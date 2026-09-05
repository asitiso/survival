import { fusionAffectsSpell, fusionModifiers } from './spell-fusions.js';
const NEUTRAL = {
    damageMultiplier: 1,
    areaMultiplier: 1,
    cooldownMultiplier: 1,
    jumpBonus: 0,
    pierceBonus: 0,
    tickMultiplier: 1,
    slowDurationMultiplier: 1,
};
export function composeFusionSpellModifiers(equipped, heroId, spellId) {
    const result = { ...NEUTRAL };
    for (const id of equipped) {
        if (!fusionAffectsSpell(id, spellId))
            continue;
        const mod = fusionModifiers(id, heroId);
        result.damageMultiplier = Math.min(1.32, result.damageMultiplier * mod.damageMultiplier);
        result.areaMultiplier = Math.min(1.28, result.areaMultiplier * mod.areaMultiplier);
        result.cooldownMultiplier = Math.max(0.78, result.cooldownMultiplier * mod.cooldownMultiplier);
        result.jumpBonus = Math.min(4, result.jumpBonus + mod.jumpBonus);
        result.pierceBonus = Math.min(3, result.pierceBonus + mod.pierceBonus);
        result.tickMultiplier = Math.min(1.45, result.tickMultiplier * mod.tickMultiplier);
        result.slowDurationMultiplier = Math.min(1.45, result.slowDurationMultiplier * mod.slowDurationMultiplier);
    }
    return result;
}
export function fusionProcForCast(equipped, spellId) {
    return equipped.filter((id) => fusionAffectsSpell(id, spellId));
}
