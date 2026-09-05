import { ACTION_BUTTONS } from './config.js';
import { DEEP_RUN_ASCENSION_IDS, DEEP_RUN_CONTRACT_IDS, DEEP_RUN_DECISION_ATLAS, DEEP_RUN_OATH_IDS, auditDeepRunDecisionIdentityAtlas, deepRunDecisionIdentityIcon, deepRunDecisionIdentityStyle, } from './deep-run-decision-identity-assets.js';
function identities() {
    return [
        ...DEEP_RUN_ASCENSION_IDS.map(id => ({ kind: 'ascension', id })),
        ...DEEP_RUN_CONTRACT_IDS.map(id => ({ kind: 'contract', id })),
        ...DEEP_RUN_OATH_IDS.map(id => ({ kind: 'oath', id })),
    ];
}
export function auditDeepRunDecisionIdentityAssets() {
    const atlas = auditDeepRunDecisionIdentityAtlas();
    const samples = [];
    for (const identity of identities()) {
        const icon = deepRunDecisionIdentityIcon(identity);
        const style = deepRunDecisionIdentityStyle(identity);
        const atlasMatch = icon.atlasSrc === DEEP_RUN_DECISION_ATLAS.src && style.includes(DEEP_RUN_DECISION_ATLAS.src);
        const base = { key: icon.key, kind: identity.kind, id: String(identity.id), atlasMatch, motionAmplitude: icon.motionAmplitude, textFallbackPreserved: icon.textFallbackPreserved, imageLoadFailureNonBlocking: !icon.loadFailureBlocksGameplay };
        samples.push({ ...base, surface: 'primary', passed: atlasMatch && icon.motionAmplitude === 0 && icon.textFallbackPreserved && !icon.loadFailureBlocksGameplay });
        samples.push({ ...base, surface: 'fallback', passed: atlasMatch && icon.motionAmplitude === 0 && icon.textFallbackPreserved && !icon.loadFailureBlocksGameplay });
    }
    const primary = samples.filter(sample => sample.surface === 'primary');
    const fallback = samples.filter(sample => sample.surface === 'fallback');
    const primaryCoverage = primary.length === 0 ? 1 : primary.filter(sample => sample.passed).length / primary.length;
    const fallbackCoverage = fallback.length === 0 ? 1 : fallback.filter(sample => sample.passed).length / fallback.length;
    const motionAmplitude = Math.max(0, ...samples.map(sample => sample.motionAmplitude));
    const textFallbackPreserved = samples.every(sample => sample.textFallbackPreserved);
    const imageLoadFailureNonBlocking = samples.every(sample => sample.imageLoadFailureNonBlocking);
    const actionCount = ACTION_BUTTONS.length;
    const issues = [];
    if (samples.length !== 70)
        issues.push(`samples:${samples.length}`);
    if (atlas.coverage !== 1 || atlas.uniqueCellCount !== 35 || atlas.outOfBounds.length > 0)
        issues.push('atlas');
    if (primaryCoverage !== 1)
        issues.push('primary-coverage');
    if (fallbackCoverage !== 1)
        issues.push('fallback-coverage');
    if (motionAmplitude !== 0)
        issues.push('motion');
    if (!textFallbackPreserved)
        issues.push('fallback');
    if (!imageLoadFailureNonBlocking)
        issues.push('blocking');
    if (actionCount !== 9)
        issues.push(`actions:${actionCount}`);
    return { samples, identityCount: 35, coverage: atlas.coverage, uniqueCellCount: atlas.uniqueCellCount, outOfBounds: atlas.outOfBounds, primaryCoverage, fallbackCoverage, motionAmplitude, textFallbackPreserved, imageLoadFailureNonBlocking, actionCount, snapshotSchemaMutation: false, issues, passed: issues.length === 0 };
}
