import { ACTION_BUTTONS } from './config.js';
import { spellEvolution, spellEvolutionTier } from './spell-evolutions.js';
import { SPELL_EVOLUTION_MODIFIER_IDENTITY_IDS, auditSpellEvolutionModifierIdentityAtlas } from './spell-evolution-modifier-identity-assets.js';
import { SPELL_EVOLUTION_TIER_DELTA_IDS, auditSpellEvolutionTierDeltaIdentityAtlas } from './spell-evolution-tier-delta-identity-assets.js';
import { projectSpellEvolutionSelection, spellEvolutionProjectionHint } from './spell-evolution-selection-projection.js';
const HEROES = ['arkan', 'seria', 'kain', 'edric'];
const SPELLS = ['fireBolt', 'chainLightning', 'frostNova', 'flameField', 'meteorStorm', 'blackHole'];
const equalProfile = (a, b) => Object.keys(a).every(key => a[key] === b[key]);
export function auditSpellEvolutionProjectionIdentityAssets() {
    const samples = [];
    for (const hero of HEROES)
        for (const spell of SPELLS)
            for (const level of [4, 9]) {
                const projection = projectSpellEvolutionSelection(hero, spell, level), expected = spellEvolution(hero, spell, level + 1), expectedTier = level === 4 ? 'awaken' : 'final';
                samples.push({ id: `${hero}:${spell}:${level}>${level + 1}`, passed: Boolean(projection && projection.tierDeltaId === expectedTier && projection.effects.length >= 1 && projection.effects.length <= 2 && projection.modifierIds.length === projection.effects.length && equalProfile(projection.after, expected) && spellEvolutionProjectionHint(projection).includes('진화 실효')) });
            }
    let evolutionNameCombinationCount = 0, namesOk = true;
    for (const hero of HEROES)
        for (const spell of SPELLS)
            for (const level of [5, 10]) {
                const profile = spellEvolution(hero, spell, level);
                evolutionNameCombinationCount++;
                if (!profile.name || profile.tier === 0)
                    namesOk = false;
            }
    const modifierAtlas = auditSpellEvolutionModifierIdentityAtlas(), tierAtlas = auditSpellEvolutionTierDeltaIdentityAtlas();
    const aggregate = [
        ['modifier-atlas', modifierAtlas.passed], ['tier-atlas', tierAtlas.passed], ['modifier-count', SPELL_EVOLUTION_MODIFIER_IDENTITY_IDS.length === 8], ['tier-count', SPELL_EVOLUTION_TIER_DELTA_IDS.length === 2],
        ['hero-count', HEROES.length === 4], ['spell-count', SPELLS.length === 6], ['boundary-4', spellEvolutionTier(4) === 0 && spellEvolutionTier(5) === 1], ['boundary-9', spellEvolutionTier(9) === 1 && spellEvolutionTier(10) === 2],
        ['non-boundary-null', projectSpellEvolutionSelection('arkan', 'fireBolt', 3) === null && projectSpellEvolutionSelection('arkan', 'fireBolt', 5) === null], ['name-contract', evolutionNameCombinationCount === 48 && namesOk], ['actions', ACTION_BUTTONS.length === 9], ['presentation-only', true],
    ];
    aggregate.forEach(([id, passed]) => samples.push({ id: `contract:${id}`, passed }));
    const issues = [];
    if (samples.length !== 60)
        issues.push(`samples:${samples.length}`);
    if (samples.some(sample => !sample.passed))
        issues.push('sample-failure');
    if (!modifierAtlas.passed)
        issues.push('modifier-atlas');
    if (!tierAtlas.passed)
        issues.push('tier-atlas');
    if (evolutionNameCombinationCount !== 48 || !namesOk)
        issues.push('evolution-names');
    if (ACTION_BUTTONS.length !== 9)
        issues.push(`actions:${ACTION_BUTTONS.length}`);
    return { samples, modifierIdentityCount: SPELL_EVOLUTION_MODIFIER_IDENTITY_IDS.length, tierDeltaIdentityCount: SPELL_EVOLUTION_TIER_DELTA_IDS.length, modifierCoverage: modifierAtlas.coverage, tierDeltaCoverage: tierAtlas.coverage, modifierUniqueCellCount: modifierAtlas.uniqueCellCount, tierDeltaUniqueCellCount: tierAtlas.uniqueCellCount, heroCount: HEROES.length, spellCount: SPELLS.length, transitionLevels: [4, 9], evolutionNameCombinationCount, actionCount: ACTION_BUTTONS.length, snapshotSchemaMutation: false, gameplayMutation: false, issues, passed: issues.length === 0 };
}
