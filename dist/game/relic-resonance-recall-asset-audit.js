import { ACTION_BUTTONS } from './config.js';
import { deriveRelicResonance } from './endless/relic-resonance.js';
import { createDefaultExtensionState, restoreExtension, serializeExtension } from './endless/snapshot.js';
import { RELIC_RESONANCE_RECALL_IDS, auditRelicResonanceRecallAtlas, relicResonanceRecallIcon, relicResonanceRecallPresentation, relicResonanceTierBadge, } from './relic-resonance-recall-assets.js';
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
export function auditRelicResonanceRecallAssets() {
    const atlas = auditRelicResonanceRecallAtlas();
    const samples = [];
    const push = (caseId, passed, relicId) => { samples.push({ caseId, passed, ...(relicId ? { relicId } : {}) }); };
    const toast = new Set(), strip = new Set(), fallback = new Set(), tierBadges = new Set();
    let textFallbackPreserved = true, imageLoadFailureNonBlocking = true, iconMotionAmplitude = 0;
    for (const relicId of RELIC_RESONANCE_RECALL_IDS) {
        const icon = relicResonanceRecallIcon(relicId);
        const presentation = relicResonanceRecallPresentation(relicId, 3);
        const identityOk = icon.atlasSrc === './assets/ui/build-identity-icons.png';
        push(`${relicId}:identity`, identityOk, relicId);
        const toastOk = icon.toastIdentitySupported;
        push(`${relicId}:toast`, toastOk, relicId);
        const badgeOk = icon.stripBadgeSupported && presentation?.badge.label === 'III';
        push(`${relicId}:strip-badge`, badgeOk, relicId);
        const fallbackOk = icon.textFallbackPreserved && !icon.loadFailureBlocksGameplay && !icon.animated && icon.motionAmplitude === 0;
        push(`${relicId}:fallback-static`, fallbackOk, relicId);
        if (toastOk)
            toast.add(relicId);
        if (badgeOk) {
            strip.add(relicId);
            tierBadges.add(relicId);
        }
        if (icon.textFallbackPreserved)
            fallback.add(relicId);
        textFallbackPreserved &&= icon.textFallbackPreserved;
        imageLoadFailureNonBlocking &&= !icon.loadFailureBlocksGameplay;
        iconMotionAmplitude = Math.max(iconMotionAmplitude, icon.motionAmplitude);
    }
    const tier0 = deriveRelicResonance({ heroId: 'arkan', relicId: 'winter-heart', fusionCount: 1, fateChoiceCount: 1, ascensionSelections: 0 });
    const tier1 = deriveRelicResonance({ heroId: 'arkan', relicId: 'winter-heart', fusionCount: 2, fateChoiceCount: 0, ascensionSelections: 0 });
    const tier2 = deriveRelicResonance({ heroId: 'arkan', relicId: 'winter-heart', fusionCount: 2, fateChoiceCount: 3, ascensionSelections: 0 });
    const tier3 = deriveRelicResonance({ heroId: 'arkan', relicId: 'winter-heart', fusionCount: 2, fateChoiceCount: 3, ascensionSelections: 3 });
    const affinity = deriveRelicResonance({ heroId: 'seria', relicId: 'winter-heart', fusionCount: 1, fateChoiceCount: 0, ascensionSelections: 0 });
    const capped = deriveRelicResonance({ heroId: 'seria', relicId: 'winter-heart', fusionCount: 99, fateChoiceCount: 99, ascensionSelections: 99 });
    const scoreOk = tier0.score === 2.5 && tier1.score === 3 && tier2.score === 6 && tier3.score === 9 && affinity.score === 2.5 && capped.score === 16;
    push('resonance:score-cap-affinity', scoreOk);
    const thresholdsOk = same([tier0.tier, tier1.tier, tier2.tier, tier3.tier], [0, 1, 2, 3]);
    push('resonance:tier-thresholds', thresholdsOk);
    const modifiersOk = same(tier1.modifiers, { spellPowerMultiplier: 1.05, cooldownMultiplier: .97, areaMultiplier: 1.035, goldMultiplier: 1.04, coreDamageTakenMultiplier: .975 }) &&
        same(tier2.modifiers, { spellPowerMultiplier: 1.1, cooldownMultiplier: .94, areaMultiplier: 1.07, goldMultiplier: 1.08, coreDamageTakenMultiplier: .95 }) &&
        same(tier3.modifiers, { spellPowerMultiplier: 1.15, cooldownMultiplier: .91, areaMultiplier: 1.105, goldMultiplier: 1.12, coreDamageTakenMultiplier: .925 });
    push('resonance:modifier-contract', modifiersOk);
    const staleBadgeGuarded = relicResonanceRecallPresentation(null, 3) === null && relicResonanceRecallPresentation('winter-heart', 0) === null && relicResonanceTierBadge(1)?.label === 'I' && relicResonanceTierBadge(2)?.label === 'II' && relicResonanceTierBadge(3)?.label === 'III';
    const extension = createDefaultExtensionState(31);
    const roundTrip = restoreExtension(serializeExtension(extension), 1);
    const snapshotRoundTrip = same(roundTrip, extension);
    const actionCount = ACTION_BUTTONS.length;
    push('presentation:stale-badge-actions-snapshot', staleBadgeGuarded && actionCount === 9 && snapshotRoundTrip);
    const toastCoverage = toast.size / 14, stripBadgeCoverage = strip.size / 14, fallbackCoverage = fallback.size / 14, tierBadgeCoverage = tierBadges.size / 14;
    const scoreContractMutation = !scoreOk, tierThresholdMutation = !thresholdsOk, modifierContractMutation = !modifiersOk, snapshotSchemaMutation = !snapshotRoundTrip;
    const issues = [];
    if (samples.length !== 60)
        issues.push(`samples:${samples.length}`);
    if (!atlas.passed)
        issues.push('atlas');
    if (toastCoverage !== 1)
        issues.push('toast-coverage');
    if (stripBadgeCoverage !== 1)
        issues.push('strip-badge-coverage');
    if (fallbackCoverage !== 1)
        issues.push('fallback-coverage');
    if (tierBadgeCoverage !== 1)
        issues.push('tier-badge-coverage');
    if (!textFallbackPreserved)
        issues.push('text-fallback');
    if (!imageLoadFailureNonBlocking)
        issues.push('blocking');
    if (iconMotionAmplitude !== 0)
        issues.push('motion');
    if (!staleBadgeGuarded)
        issues.push('stale-badge');
    if (scoreContractMutation)
        issues.push('score-mutation');
    if (tierThresholdMutation)
        issues.push('tier-threshold-mutation');
    if (modifierContractMutation)
        issues.push('modifier-mutation');
    if (actionCount !== 9)
        issues.push(`actions:${actionCount}`);
    if (snapshotSchemaMutation)
        issues.push('snapshot-schema-mutation');
    if (samples.some(sample => !sample.passed))
        issues.push('sample-failure');
    return { samples, relicCount: 14, coverage: atlas.coverage, uniqueCellCount: atlas.uniqueCellCount, outOfBounds: [...atlas.outOfBounds], toastCoverage, stripBadgeCoverage, fallbackCoverage, tierBadgeCoverage, textFallbackPreserved, imageLoadFailureNonBlocking, iconMotionAmplitude, staleBadgeGuarded, scoreContractMutation, tierThresholdMutation, modifierContractMutation, actionCount, snapshotSchemaMutation, issues, passed: issues.length === 0 };
}
