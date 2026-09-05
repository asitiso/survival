import { clamp } from '../../core/math.js';
import { deepRunDecisionIdentityStyle } from '../deep-run-decision-identity-assets.js';
import { runContractRequirementIdentityStyle } from '../run-contract-requirement-identity-assets.js';
import { runContractBoonEffectIdentityStyle } from '../run-contract-boon-effect-identity-assets.js';
import { getAscensionModifiers } from './ascension.js';
import { getWorldModifiers } from './world-evolution.js';
function fateFromChoices(choices) {
    const latest = choices.at(-1);
    if (latest === 'golden')
        return 'gold';
    if (latest === 'frenzy' || latest === 'guardian')
        return latest;
    return 'none';
}
function deviceClass(quality) {
    return quality === 'low' ? 'low' : quality === 'medium' ? 'mid' : 'high';
}
export function buildLegacyRunView(input) {
    return {
        heroId: input.heroId,
        elapsedMs: Math.max(0, input.elapsedSeconds) * 1000,
        level: Math.max(1, input.level),
        threat: clamp(input.threat, 0, 5),
        kills: Math.max(0, input.kills),
        bossesDefeated: Math.max(0, input.bossesDefeated),
        elitesDefeated: Math.max(0, input.elitesDefeated),
        gold: Math.max(0, input.gold),
        xp: Math.max(0, input.xp),
        guardianCoreHp: Math.max(0, input.guardianCoreHp),
        guardianCoreMaxHp: Math.max(1, input.guardianCoreMaxHp),
        fate: fateFromChoices(input.fateChoices),
        spellFusionCount: Math.max(0, input.spellFusionCount),
        mapEvolutionRank: Math.max(0, input.mapEvolutionRank),
        masteryLevel: Math.max(1, input.masteryLevel),
        deviceClass: deviceClass(input.presentationQuality),
    };
}
const CONTRACT_ACCENTS = {
    slayer: '#ff7f6d',
    warden: '#7edcff',
    arcane: '#b996ff',
    hunter: '#ffd66e',
    survivor: '#7fe0a2',
};
export function contractChoiceCards(options) {
    return options.slice(0, 3).map((option) => ({
        optionId: option.optionId,
        family: option.family,
        title: option.title,
        description: option.description,
        accent: CONTRACT_ACCENTS[option.family],
        identityIconStyle: deepRunDecisionIdentityStyle({ kind: 'contract', id: option.family }),
        secondaryIdentityStyles: [runContractRequirementIdentityStyle(option.family), runContractBoonEffectIdentityStyle(option.family)],
    }));
}
export function composeEndlessHostModifiers(state, threat) {
    const world = getWorldModifiers(state.world.current, threat);
    const ascension = getAscensionModifiers(state.ascension.tier);
    return {
        spawnPressureMultiplier: clamp(world.spawnMultiplier * ascension.spawnBudgetMultiplier, 0.75, 2.1),
        eliteIntervalMultiplier: clamp(1 / Math.max(0.1, world.eliteMultiplier * ascension.eliteBudgetMultiplier), 0.55, 1.1),
        goldMultiplier: clamp(world.goldMultiplier * ascension.goldMultiplier, 0.8, 2),
        masteryXpMultiplier: clamp(world.masteryMultiplier * ascension.masteryXpMultiplier, 0.8, 2),
        enemyHealthMultiplier: ascension.enemyHealthMultiplier,
        enemyDamageMultiplier: ascension.enemyDamageMultiplier,
        projectilePressureMultiplier: clamp(world.projectileMultiplier, 0.8, 1.35),
        coreRecoveryMultiplier: world.coreRecoveryMultiplier,
    };
}
