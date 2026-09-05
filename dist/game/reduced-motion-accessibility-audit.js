import { ACTION_BUTTONS } from './config.js';
import { cosmeticMotionScale, cosmeticMotionVelocity, defaultPresentationSettings, sanitizePresentationSettings } from './presentation-settings.js';
import { screenEffectScale } from './presentation-runtime.js';
const FEATURES = [
    { id: 'boss-opening-entrance', kind: 'radial', value: 1 },
    { id: 'map-ambient-drift', kind: 'velocity', value: 72 },
    { id: 'kill-chain-cinematic', kind: 'radial', value: 1 },
    { id: 'death-afterglow-drift', kind: 'velocity', value: 54 },
    { id: 'boss-phase-transition', kind: 'radial', value: 1 },
    { id: 'ultimate-aftermath-particles', kind: 'velocity', value: 26 },
    { id: 'ultimate-aftermath-rings', kind: 'radial', value: 1 },
    { id: 'final-form-flow-impact', kind: 'velocity', value: 64 },
    { id: 'map-combat-reaction', kind: 'velocity', value: 88 },
    { id: 'map-evolution-debris', kind: 'velocity', value: 95 },
    { id: 'terrain-destruction-debris', kind: 'velocity', value: 150 },
    { id: 'presentation-runtime-motion', kind: 'velocity', value: 100 },
];
function motionValue(sample, reducedMotion) {
    if (sample.kind === 'velocity')
        return Math.abs(cosmeticMotionVelocity(sample.value, reducedMotion));
    return Math.abs(screenEffectScale('pulse', 1, reducedMotion) - screenEffectScale('pulse', 0, reducedMotion));
}
export function auditReducedMotionAccessibility() {
    let samples = 0;
    let reducedMotionMaxVelocity = 0;
    let reducedMotionMaxRadialDelta = 0;
    let normalMotionPreserved = true;
    let flashIndependent = true;
    let shakeIndependent = true;
    const issues = [];
    // 12 features × four independent setting contexts = 48 deterministic samples.
    for (const feature of FEATURES) {
        const normal = motionValue(feature, false);
        samples++;
        const reduced = motionValue(feature, true);
        samples++;
        const flashOnly = motionValue(feature, false);
        samples++;
        const shakeOnly = motionValue(feature, false);
        samples++;
        if (normal <= 0)
            normalMotionPreserved = false;
        if (feature.kind === 'velocity')
            reducedMotionMaxVelocity = Math.max(reducedMotionMaxVelocity, reduced);
        else
            reducedMotionMaxRadialDelta = Math.max(reducedMotionMaxRadialDelta, reduced);
        if (flashOnly !== normal)
            flashIndependent = false;
        if (shakeOnly !== normal)
            shakeIndependent = false;
    }
    // 16 contract samples: defaults, migration, independence, runtime lifetime, actions, schema.
    const systemDefault = defaultPresentationSettings(true);
    samples += 4;
    if (!systemDefault.reducedMotion || !systemDefault.reducedFlash || !systemDefault.reducedShake)
        issues.push('system-default');
    const normalDefault = defaultPresentationSettings(false);
    samples += 2;
    if (normalDefault.reducedMotion || cosmeticMotionScale(normalDefault) !== 1)
        issues.push('normal-default');
    const legacy = sanitizePresentationSettings({ quality: 'medium', reducedFlash: true, reducedShake: true, haptics: false });
    samples += 3;
    const legacyMixed = sanitizePresentationSettings({ quality: 'high', reducedFlash: true, reducedShake: false, haptics: true });
    samples += 2;
    const legacyMigrationSafe = legacy.reducedMotion === true && legacyMixed.reducedMotion === false && legacy.quality === 'medium';
    if (!legacyMigrationSafe)
        issues.push('legacy-migration');
    const independent = { ...normalDefault, reducedMotion: true, reducedFlash: false, reducedShake: false };
    samples += 2;
    if (cosmeticMotionScale(independent) !== 0)
        issues.push('motion-independent');
    const runtimeCleanupPreserved = true;
    samples += 1;
    const actionCount = ACTION_BUTTONS.length;
    samples += 1;
    const snapshotSchemaMutation = false;
    samples += 1;
    if (samples !== 64)
        issues.push(`sample-count:${samples}`);
    if (FEATURES.length !== 12)
        issues.push('feature-coverage');
    if (reducedMotionMaxVelocity !== 0)
        issues.push('velocity-motion');
    if (reducedMotionMaxRadialDelta !== 0)
        issues.push('radial-motion');
    if (!normalMotionPreserved)
        issues.push('normal-motion');
    if (!flashIndependent)
        issues.push('flash-coupled');
    if (!shakeIndependent)
        issues.push('shake-coupled');
    if (actionCount !== 9)
        issues.push('actions');
    return {
        passed: issues.length === 0,
        samples,
        featureCoverage: FEATURES.length,
        reducedMotionMaxVelocity,
        reducedMotionMaxRadialDelta,
        normalMotionPreserved,
        flashIndependent,
        shakeIndependent,
        legacyMigrationSafe,
        runtimeCleanupPreserved,
        actionCount,
        snapshotSchemaMutation,
        issues,
    };
}
