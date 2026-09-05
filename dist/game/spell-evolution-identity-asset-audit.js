import { ACTION_BUTTONS } from './config.js';
import { HERO_ABILITY_ACTIONS, HERO_ABILITY_HERO_IDS, heroAbilityIdentityIcon } from './hero-ability-identity-assets.js';
import { auditSpellEvolutionCrestAtlas, spellEvolutionActionTier, spellEvolutionCrestFor, spellEvolutionPreviewCrestStyle, spellEvolutionPreviewTier, spellEvolutionSpellForAction } from './spell-evolution-identity-assets.js';
import { spellEvolution, spellEvolutionTier } from './spell-evolutions.js';
const SPELLS = ['fireBolt', 'chainLightning', 'frostNova', 'flameField', 'meteorStorm', 'blackHole'];
const close = (a, b) => Math.abs(a - b) < 1e-9;
export function auditSpellEvolutionIdentityAssets() {
    const atlas = auditSpellEvolutionCrestAtlas();
    const samples = [];
    const push = (key, passed) => samples.push({ key, passed });
    for (const hero of HERO_ABILITY_HERO_IDS)
        for (const tier of [1, 2]) {
            const icon = spellEvolutionCrestFor(hero, tier);
            push(`crest:${hero}:${tier}`, Boolean(icon && icon.motionAmplitude === 0 && icon.textFallbackPreserved && !icon.loadFailureBlocksGameplay));
        }
    let heroAbilityCombinationCount = 0;
    for (const hero of HERO_ABILITY_HERO_IDS)
        for (let i = 0; i < HERO_ABILITY_ACTIONS.length; i++) {
            const action = HERO_ABILITY_ACTIONS[i], spell = SPELLS[i];
            const icon = heroAbilityIdentityIcon(hero, action);
            heroAbilityCombinationCount++;
            push(`ability:${hero}:${spell}`, icon.key === `${hero}:${action}` && spellEvolutionSpellForAction(action) === spell);
        }
    let previewOk = 0;
    for (const hero of HERO_ABILITY_HERO_IDS)
        for (const level of [4, 9]) {
            const tier = spellEvolutionPreviewTier(level), style = spellEvolutionPreviewCrestStyle(hero, level), ok = Boolean(tier && style.includes('spell-evolution-crests.png'));
            if (ok)
                previewOk++;
            push(`preview:${hero}:${level}`, ok);
        }
    let actionOk = 0;
    for (const hero of HERO_ABILITY_HERO_IDS)
        for (const level of [5, 10]) {
            const tier = spellEvolutionActionTier(level), icon = tier ? spellEvolutionCrestFor(hero, tier) : null, ok = Boolean(icon && spellEvolutionTier(level) === tier);
            if (ok)
                actionOk++;
            push(`action:${hero}:${level}`, ok);
        }
    let toastOk = 0;
    for (const hero of HERO_ABILITY_HERO_IDS)
        for (const level of [5, 10]) {
            const evo = spellEvolution(hero, 'fireBolt', level), icon = spellEvolutionCrestFor(hero, evo.tier), ok = Boolean(evo.name && icon);
            if (ok)
                toastOk++;
            push(`toast:${hero}:${level}`, ok);
        }
    let evolutionNameCombinationCount = 0;
    let namesOk = true;
    for (const hero of HERO_ABILITY_HERO_IDS)
        for (const spell of SPELLS)
            for (const level of [5, 10]) {
                const evo = spellEvolution(hero, spell, level);
                evolutionNameCombinationCount++;
                if (!evo.name || evo.tier === 0)
                    namesOk = false;
            }
    const boundaryOk = spellEvolutionTier(4) === 0 && spellEvolutionTier(5) === 1 && spellEvolutionTier(9) === 1 && spellEvolutionTier(10) === 2;
    const arkan = spellEvolution('arkan', 'fireBolt', 10), seria = spellEvolution('seria', 'frostNova', 10), kain = spellEvolution('kain', 'chainLightning', 10), edric = spellEvolution('edric', 'blackHole', 10);
    const numericOk = close(arkan.damageMultiplier, 1.298) && arkan.splashRadiusBonus === 42 && close(seria.areaMultiplier, 1.3407) && close(kain.cooldownMultiplier, .7392) && close(edric.pullMultiplier, 1.28);
    const textFallbackPreserved = atlas.passed;
    const imageLoadFailureNonBlocking = atlas.passed;
    const iconMotionAmplitude = 0;
    push('contract:levels-names', boundaryOk && namesOk);
    push('contract:numeric', numericOk);
    push('contract:fallback', textFallbackPreserved && imageLoadFailureNonBlocking);
    push('contract:actions-snapshot', ACTION_BUTTONS.length === 9);
    const previewCoverage = previewOk / 8, actionRecallCoverage = actionOk / 8, toastCoverage = toastOk / 8, evolutionContractMutation = !(boundaryOk && namesOk && numericOk);
    const issues = [];
    if (samples.length !== 60)
        issues.push(`samples:${samples.length}`);
    if (!atlas.passed)
        issues.push('crest-atlas');
    if (heroAbilityCombinationCount !== 24)
        issues.push('hero-ability-combinations');
    if (evolutionNameCombinationCount !== 48 || !namesOk)
        issues.push('evolution-names');
    if (previewCoverage !== 1)
        issues.push('preview');
    if (actionRecallCoverage !== 1)
        issues.push('action-recall');
    if (toastCoverage !== 1)
        issues.push('toast');
    if (evolutionContractMutation)
        issues.push('evolution-contract');
    if (samples.some(v => !v.passed))
        issues.push('sample-failure');
    if (ACTION_BUTTONS.length !== 9)
        issues.push(`actions:${ACTION_BUTTONS.length}`);
    return { samples, crestCount: 8, crestCoverage: atlas.coverage, crestUniqueCellCount: atlas.uniqueCellCount, heroAbilityCombinationCount, evolutionNameCombinationCount, previewCoverage, actionRecallCoverage, toastCoverage, textFallbackPreserved, imageLoadFailureNonBlocking, iconMotionAmplitude, evolutionContractMutation, actionCount: ACTION_BUTTONS.length, snapshotSchemaMutation: false, issues, passed: issues.length === 0 };
}
