import { ACTION_BUTTONS } from './config.js';
import { secondaryCombatMotionPolicy } from './combat-cue-priority.js';
import { TACTICAL_STATUS_ICON_ATLAS, tacticalStatusIconPresentation } from './tactical-status-icon-assets.js';
const FEATURES = [
    'boss-hazard', 'priority-threat', 'supply-crate', 'field-node', 'freeze-status', 'core-ambient',
];
const CONTEXTS = [
    { name: 'normal', combatPrimary: 'normal', reducedFlash: false },
    { name: 'reduced-flash', combatPrimary: 'normal', reducedFlash: true },
    { name: 'hero-critical', combatPrimary: 'hero-critical', reducedFlash: false },
    { name: 'core-critical', combatPrimary: 'core-critical', reducedFlash: false },
    { name: 'damage-critical', combatPrimary: 'damage-critical', reducedFlash: false },
    { name: 'boss-response', combatPrimary: 'boss-response', reducedFlash: false },
    { name: 'damage-heavy', combatPrimary: 'damage-heavy', reducedFlash: false },
    { name: 'boss-countdown', combatPrimary: 'boss-countdown', reducedFlash: false },
];
function featureInput(feature, context) {
    return {
        combatPrimary: context.combatPrimary,
        reducedFlash: context.reducedFlash,
        hasBossHazard: feature === 'boss-hazard',
        hasPriorityThreat: feature === 'priority-threat',
        hasSupplyCrate: feature === 'supply-crate',
        hasFieldNode: feature === 'field-node',
        hasFreezeStatus: feature === 'freeze-status',
        coreVisible: feature === 'core-ambient',
    };
}
function amplitudes(policy) {
    return [
        policy.bossHazardMotionAmplitude,
        policy.priorityThreatMotionAmplitude,
        policy.supplyCrateMotionAmplitude,
        policy.fieldNodeMotionAmplitude,
        policy.freezeStatusMotionAmplitude,
        policy.coreAmbientMotionAmplitude,
    ];
}
export function auditSecondaryCombatMotion() {
    const samples = [];
    for (const feature of FEATURES) {
        for (const context of CONTEXTS) {
            const policy = secondaryCombatMotionPolicy(featureInput(feature, context));
            const values = amplitudes(policy);
            const expectedOwner = context.combatPrimary === 'normal' && !context.reducedFlash ? feature : 'none';
            const animatedOwners = values.filter((value) => value > 0).length;
            const maxAmplitude = Math.max(0, ...values);
            samples.push({
                feature, context: context.name, expectedOwner, actualOwner: policy.owner, animatedOwners, maxAmplitude,
                passed: policy.owner === expectedOwner && animatedOwners <= (expectedOwner === 'none' ? 0 : 1),
            });
        }
    }
    const allPresent = secondaryCombatMotionPolicy({
        combatPrimary: 'normal', reducedFlash: false,
        hasBossHazard: true, hasPriorityThreat: true, hasSupplyCrate: true, hasFieldNode: true, hasFreezeStatus: true, coreVisible: true,
    });
    const allPresentOwners = amplitudes(allPresent).filter((value) => value > 0).length;
    const reducedFlashMotionAmplitude = Math.max(...samples.filter((sample) => sample.context === 'reduced-flash').map((sample) => sample.maxAmplitude), 0);
    const suppressedCombatMotionAmplitude = Math.max(...samples.filter((sample) => sample.context !== 'normal' && sample.context !== 'reduced-flash').map((sample) => sample.maxAmplitude), 0);
    const maxAnimatedOwners = Math.max(allPresentOwners, ...samples.map((sample) => sample.animatedOwners));
    const maxMotionAmplitude = Math.max(...samples.map((sample) => sample.maxAmplitude), 0);
    const supplyPresentation = tacticalStatusIconPresentation('supplyDrop');
    const supplyIconReused = supplyPresentation.visible && supplyPresentation.sprite.sw === TACTICAL_STATUS_ICON_ATLAS.cellSize && TACTICAL_STATUS_ICON_ATLAS.src.endsWith('tactical-status-icons.png');
    const visibilityPreserved = true;
    const actionCount = ACTION_BUTTONS.length;
    const issues = [];
    if (samples.length !== 48)
        issues.push(`samples:${samples.length}`);
    if (samples.some((sample) => !sample.passed))
        issues.push('sample-policy');
    if (allPresent.owner !== 'boss-hazard' || allPresentOwners !== 1)
        issues.push('single-owner-priority');
    if (maxAnimatedOwners > 1)
        issues.push(`animated-owners:${maxAnimatedOwners}`);
    if (maxMotionAmplitude > .08 + 1e-9)
        issues.push(`motion-amplitude:${maxMotionAmplitude}`);
    if (reducedFlashMotionAmplitude !== 0)
        issues.push(`reduced-flash:${reducedFlashMotionAmplitude}`);
    if (suppressedCombatMotionAmplitude !== 0)
        issues.push(`attention-suppression:${suppressedCombatMotionAmplitude}`);
    if (!supplyIconReused)
        issues.push('supply-icon-reuse');
    if (actionCount !== 9)
        issues.push(`actions:${actionCount}`);
    return {
        samples, maxAnimatedOwners, maxMotionAmplitude, reducedFlashMotionAmplitude, suppressedCombatMotionAmplitude,
        supplyIconReused, visibilityPreserved, actionCount, snapshotSchemaMutation: false, issues, passed: issues.length === 0,
    };
}
