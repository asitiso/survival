import { ACTION_BUTTONS } from './config.js';
import { heroAscensionCatalog, heroAscensionModifiers, advanceHeroAscension, createDefaultHeroAscensionState, selectHeroAscension } from './endless/hero-ascension.js';
import { HERO_ASCENSION_MODIFIER_IDENTITY_IDS, auditHeroAscensionModifierIdentityAtlas } from './hero-ascension-modifier-identity-assets.js';
import { HERO_ASCENSION_BUILD_DIRECTION_IDS, auditHeroAscensionBuildDirectionIdentityAtlas } from './hero-ascension-build-direction-identity-assets.js';
import { heroAscensionProjectionHint, projectHeroAscensionSelection } from './hero-ascension-projection.js';
const HEROES = ['arkan', 'seria', 'kain', 'edric'];
const eq = (a, b) => Math.abs(a - b) < 1e-9;
const modifierEqual = (a, b) => Object.keys(a).every(key => eq(a[key], b[key]));
export function auditHeroAscensionProjectionIdentityAssets() {
    const samples = [];
    for (const hero of HEROES) {
        const catalog = heroAscensionCatalog(hero);
        catalog.forEach(option => {
            const projection = projectHeroAscensionSelection([], option.optionId);
            const expected = heroAscensionModifiers([option.optionId]);
            samples.push({ id: `${hero}:first:${option.optionId}`, passed: projection.directionId === 'expand' && projection.effects.length >= 1 && projection.effects.length <= 2 && projection.modifierIds.length === projection.effects.length && modifierEqual(projection.after, expected) && heroAscensionProjectionHint(projection).startsWith('실효 · ') });
        });
    }
    for (const hero of HEROES) {
        const catalog = heroAscensionCatalog(hero);
        catalog.forEach((option, index) => {
            const prior = catalog[(index + 1) % catalog.length].optionId;
            const projection = projectHeroAscensionSelection([prior], option.optionId);
            const expected = heroAscensionModifiers([prior, option.optionId]);
            samples.push({ id: `${hero}:second:${prior}>${option.optionId}`, passed: projection.effects.length >= 1 && projection.effects.length <= 2 && projection.modifierIds.length === projection.effects.length && modifierEqual(projection.after, expected) && HERO_ASCENSION_BUILD_DIRECTION_IDS.includes(projection.directionId) });
        });
    }
    let state = createDefaultHeroAscensionState();
    const m35 = advanceHeroAscension('arkan', 35 * 60_000, state);
    state = m35.state;
    const p35 = state.pendingOffer?.options[0]?.optionId;
    if (p35)
        state = selectHeroAscension(state, p35);
    const m50 = advanceHeroAscension('arkan', 50 * 60_000, state);
    state = m50.state;
    const p50 = state.pendingOffer?.options[0]?.optionId;
    if (p50)
        state = selectHeroAscension(state, p50);
    const m65 = advanceHeroAscension('arkan', 65 * 60_000, state);
    state = m65.state;
    const p65 = state.pendingOffer?.options[0]?.optionId;
    if (p65)
        state = selectHeroAscension(state, p65);
    const modifierAtlas = auditHeroAscensionModifierIdentityAtlas();
    const directionAtlas = auditHeroAscensionBuildDirectionIdentityAtlas();
    const hybrid = projectHeroAscensionSelection(['overcharge'], 'thunder-step');
    const focus = projectHeroAscensionSelection(['overcharge', 'tempest-loop'], 'thunder-step');
    const expand = projectHeroAscensionSelection([], 'wildfire-doctrine');
    const aggregate = [
        ['modifier-atlas', modifierAtlas.passed],
        ['direction-atlas', directionAtlas.passed],
        ['modifier-contract', HERO_ASCENSION_MODIFIER_IDENTITY_IDS.length === 8],
        ['direction-contract', HERO_ASCENSION_BUILD_DIRECTION_IDS.length === 3],
        ['expand-direction', expand.directionId === 'expand'],
        ['hybrid-direction', hybrid.directionId === 'hybrid'],
        ['focus-direction', focus.directionId === 'focus'],
        ['milestone-35', m35.state.pendingOffer?.milestone === 35],
        ['milestone-50', m50.state.pendingOffer?.milestone === 50],
        ['milestone-65', m65.state.pendingOffer?.milestone === 65],
        ['selection-cap', state.selected.length === 3],
        ['actions', ACTION_BUTTONS.length === 9],
    ];
    aggregate.forEach(([id, passed]) => samples.push({ id: `contract:${id}`, passed }));
    const issues = [];
    if (samples.length !== 60)
        issues.push(`samples:${samples.length}`);
    if (samples.some(sample => !sample.passed))
        issues.push('sample-failure');
    if (!modifierAtlas.passed)
        issues.push('modifier-atlas');
    if (!directionAtlas.passed)
        issues.push('direction-atlas');
    if (HERO_ASCENSION_MODIFIER_IDENTITY_IDS.length !== 8)
        issues.push('modifier-identity-contract');
    if (HERO_ASCENSION_BUILD_DIRECTION_IDS.length !== 3)
        issues.push('direction-identity-contract');
    if (ACTION_BUTTONS.length !== 9)
        issues.push(`actions:${ACTION_BUTTONS.length}`);
    return {
        samples, modifierIdentityCount: HERO_ASCENSION_MODIFIER_IDENTITY_IDS.length, directionIdentityCount: HERO_ASCENSION_BUILD_DIRECTION_IDS.length,
        modifierCoverage: modifierAtlas.coverage, directionCoverage: directionAtlas.coverage, modifierUniqueCellCount: modifierAtlas.uniqueCellCount, directionUniqueCellCount: directionAtlas.uniqueCellCount,
        milestones: [35, 50, 65], maxSelections: 3, actionCount: ACTION_BUTTONS.length, snapshotSchemaMutation: false, gameplayMutation: false, issues, passed: issues.length === 0,
    };
}
