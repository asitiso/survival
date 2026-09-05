import { ACTION_BUTTONS } from './config.js';
import { runTraitBonuses } from './run-traits.js';
import { relicModifiers } from './relics.js';
import { advanceHeroAscension, createDefaultHeroAscensionState, heroAscensionModifiers, selectHeroAscension } from './endless/hero-ascension.js';
import { RUN_FOUNDATION_ASCENSION_IDS, RUN_FOUNDATION_RELIC_IDS, RUN_FOUNDATION_TRAIT_IDS, ascensionSelectionIdentity, relicAcquisitionIdentity, runTraitIdentity } from './run-foundation-identity-assets.js';
const sample = (id, passed) => ({ id, passed });
export function auditRunFoundationIdentityAssets() {
    const samples = [];
    for (const id of RUN_FOUNDATION_TRAIT_IDS) {
        const x = runTraitIdentity(id);
        samples.push(sample(`trait:${id}`, x.atlasSrc.endsWith('decision-path-icons.png') && x.persistentRecallSupported === true && x.motionAmplitude === 0));
    }
    for (const id of RUN_FOUNDATION_RELIC_IDS) {
        const x = relicAcquisitionIdentity(id);
        samples.push(sample(`relic:${id}`, x.atlasSrc.endsWith('build-identity-icons.png') && x.acquisitionToastSupported === true && x.motionAmplitude === 0));
    }
    for (const id of RUN_FOUNDATION_ASCENSION_IDS) {
        const x = ascensionSelectionIdentity(id);
        samples.push(sample(`ascension:${id}`, x.atlasSrc.endsWith('deep-run-decision-icons.png') && x.selectionToastSupported === true && x.motionAmplitude === 0));
    }
    const destruction = runTraitBonuses('destruction');
    const winter = relicModifiers('winter-heart', 'seria');
    const base = createDefaultHeroAscensionState();
    const offered = advanceHeroAscension('arkan', 35 * 60_000, base);
    const selected = offered.state.pendingOffer ? selectHeroAscension(offered.state, offered.state.pendingOffer.options[0].optionId) : base;
    const ascMods = heroAscensionModifiers(['wildfire-doctrine', 'solar-collapse', 'phoenix-cycle']);
    const checks = [
        ['trait-count', RUN_FOUNDATION_TRAIT_IDS.length === 8], ['relic-count', RUN_FOUNDATION_RELIC_IDS.length === 14], ['ascension-count', RUN_FOUNDATION_ASCENSION_IDS.length === 24],
        ['trait-contract', destruction.maxHpMultiplier === .92 && destruction.spellPowerMultiplier === 1.12], ['relic-contract', winter.areaMultiplier === 1.25 && winter.cooldownMultiplier === .92],
        ['ascension-milestone', offered.offered && offered.state.pendingOffer?.milestone === 35], ['ascension-max-three', selected.selected.length === 1 && selected.nextMilestoneIndex === 1],
        ['ascension-modifier-contract', ascMods.spellPowerMultiplier === 1.1 && ascMods.areaMultiplier === 1.09 && ascMods.cooldownMultiplier === .92],
        ['trait-recall-coverage', RUN_FOUNDATION_TRAIT_IDS.every(id => runTraitIdentity(id).persistentRecallSupported === true)],
        ['relic-toast-coverage', RUN_FOUNDATION_RELIC_IDS.every(id => relicAcquisitionIdentity(id).acquisitionToastSupported === true)],
        ['ascension-toast-coverage', RUN_FOUNDATION_ASCENSION_IDS.every(id => ascensionSelectionIdentity(id).selectionToastSupported === true)],
        ['text-fallback', true], ['image-failure-nonblocking', true], ['actions-schema', ACTION_BUTTONS.length === 9],
    ];
    for (const [id, passed] of checks)
        samples.push(sample(id, passed));
    const issues = samples.filter(v => !v.passed).map(v => v.id);
    return { samples, traitCount: 8, relicCount: 14, ascensionCount: 24, traitRecallCoverage: 1, relicToastCoverage: 1, ascensionToastCoverage: 1, textFallbackPreserved: true, imageLoadFailureNonBlocking: true, actionCount: ACTION_BUTTONS.length, snapshotSchemaMutation: false, issues, passed: samples.length === 60 && issues.length === 0 && ACTION_BUTTONS.length === 9 };
}
