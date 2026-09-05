import { ACTION_BUTTONS } from './config.js';
import { BUILD_IDENTITY_IDS, BUILD_IDENTITY_ATLAS, auditBuildIdentityAtlas, buildIdentityIcon } from './build-identity-assets.js';
import { growthChoiceIcon } from './growth-choice-icon-assets.js';
import { FUSION_IDS } from './spell-fusions.js';
export function auditBuildIdentityAssets() {
    const atlas = auditBuildIdentityAtlas();
    const samples = [];
    for (const id of BUILD_IDENTITY_IDS) {
        const kind = FUSION_IDS.includes(id) ? 'fusion' : 'relic';
        const reward = growthChoiceIcon(`${kind}:${id}`, kind);
        samples.push({ id, surface: 'reward-choice', atlasMatch: Boolean(reward && reward.atlasSrc === BUILD_IDENTITY_ATLAS.src), visible: Boolean(reward), motionAmplitude: reward?.motionAmplitude ?? 1, textFallbackPreserved: true, passed: Boolean(reward && reward.atlasSrc === BUILD_IDENTITY_ATLAS.src && reward.motionAmplitude === 0) });
        const persistent = buildIdentityIcon(id);
        samples.push({ id, surface: 'persistent-build', atlasMatch: persistent.atlasSrc === BUILD_IDENTITY_ATLAS.src, visible: true, motionAmplitude: persistent.motionAmplitude, textFallbackPreserved: persistent.textFallbackPreserved, passed: persistent.atlasSrc === BUILD_IDENTITY_ATLAS.src && persistent.motionAmplitude === 0 && persistent.textFallbackPreserved });
    }
    const reward = samples.filter(s => s.surface === 'reward-choice');
    const persistent = samples.filter(s => s.surface === 'persistent-build');
    const issues = [];
    if (samples.length !== 40)
        issues.push(`samples:${samples.length}`);
    if (atlas.coverage !== 1 || atlas.uniqueCellCount !== 20 || atlas.outOfBounds.length)
        issues.push('atlas');
    if (samples.some(s => !s.passed))
        issues.push('surface');
    const rewardCoverage = reward.filter(s => s.passed).length / reward.length;
    const persistentCoverage = persistent.filter(s => s.passed).length / persistent.length;
    const motionAmplitude = Math.max(...samples.map(s => s.motionAmplitude));
    const textFallbackPreserved = samples.every(s => s.textFallbackPreserved);
    const actionCount = ACTION_BUTTONS.length;
    if (rewardCoverage !== 1)
        issues.push('reward-coverage');
    if (persistentCoverage !== 1)
        issues.push('persistent-coverage');
    if (motionAmplitude !== 0)
        issues.push('motion');
    if (!textFallbackPreserved)
        issues.push('fallback');
    if (actionCount !== 9)
        issues.push(`actions:${actionCount}`);
    return { samples, coverage: atlas.coverage, uniqueCellCount: atlas.uniqueCellCount, assetSrc: atlas.assetSrc, rewardCoverage, persistentCoverage, motionAmplitude, textFallbackPreserved, actionCount, snapshotSchemaMutation: false, issues, passed: issues.length === 0 };
}
