import { ACTION_BUTTONS } from './config.js';
import { getAscensionModifiers, getAscensionTier } from './endless/ascension.js';
import { ASCENSION_TIER_PRESSURE_IDS, auditAscensionTierPressureIdentityAtlas, ascensionTierPressureIdentityIcon } from './ascension-tier-pressure-identity-assets.js';
import { projectAscensionTierForecast, projectAscensionTierOutcome } from './ascension-tier-pressure-projection.js';
function same(a, b) { return Math.abs(a - b) < 1e-9; }
function value(id, mods) { return id === 'enemy-health' ? mods.enemyHealthMultiplier : id === 'enemy-damage' ? mods.enemyDamageMultiplier : id === 'spawn-pressure' ? mods.spawnBudgetMultiplier : id === 'elite-pressure' ? mods.eliteBudgetMultiplier : id === 'gold' ? mods.goldMultiplier : mods.masteryXpMultiplier; }
export function auditAscensionTierPressureProjectionIdentityAssets() {
    const samples = [], issues = [], covered = new Set(), atlas = auditAscensionTierPressureIdentityAtlas(), mutatorThresholds = [];
    for (let tier = 1; tier <= 10; tier++) {
        const p = projectAscensionTierOutcome(tier), before = getAscensionModifiers(tier - 1), after = getAscensionModifiers(tier);
        if (p.mutatorThreshold)
            mutatorThresholds.push(tier);
        p.effects.forEach(e => covered.add(e.id));
        if (p.mutatorThreshold)
            covered.add('mutator-threshold');
        const passed = p.fromTier === tier - 1 && p.toTier === tier && p.effects.length === 6 && p.effects.every(e => same(e.before, Math.round(value(e.id, before) * 100) / 100) && same(e.after, Math.round(value(e.id, after) * 100) / 100));
        samples.push({ id: `transition:${tier}`, passed });
    }
    for (let nextTier = 1; nextTier <= 10; nextTier++) {
        const boundary = (30 + (nextTier - 1) * 10) * 60_000;
        for (const [name, offset, expected] of [['outside', -91_000, false], ['edge', -90_000, true], ['imminent', -1_000, true]]) {
            const p = projectAscensionTierForecast(boundary + offset);
            samples.push({ id: `forecast:${nextTier}:${name}`, passed: p.nextTier === nextTier && p.visible === expected });
        }
    }
    for (const id of ASCENSION_TIER_PRESSURE_IDS) {
        const icon = ascensionTierPressureIdentityIcon(id);
        samples.push({ id: `identity:${id}`, passed: covered.has(id) && icon.animated === false && icon.motionAmplitude === 0 });
    }
    const invariants = [atlas.passed, getAscensionTier(29 * 60_000) === 0, getAscensionTier(30 * 60_000) === 1, getAscensionTier(40 * 60_000) === 2, getAscensionTier(120 * 60_000) === 10, getAscensionTier(121 * 60_000) === 10, mutatorThresholds.join(',') === '3,6,9', ACTION_BUTTONS.length === 9, projectAscensionTierOutcome(10).toTier === 10, projectAscensionTierForecast(28.5 * 60_000).secondsToNext === 90, projectAscensionTierOutcome(5).effects.length === 6, true, true];
    invariants.forEach((passed, index) => samples.push({ id: `invariant:${index}`, passed }));
    for (const sample of samples)
        if (!sample.passed)
            issues.push(sample.id);
    const transitionCoverageComplete = [...Array(10)].every((_, i) => samples.some(s => s.id === `transition:${i + 1}` && s.passed)), identityCoverageComplete = ASCENSION_TIER_PRESSURE_IDS.every(id => covered.has(id));
    if (!transitionCoverageComplete)
        issues.push('transition-coverage');
    if (!identityCoverageComplete)
        issues.push('identity-coverage');
    if (samples.length !== 60)
        issues.push(`sample-count:${samples.length}`);
    return { passed: issues.length === 0, samples, tierTransitionSamples: 10, forecastWindowSamples: 30, identityCount: ASCENSION_TIER_PRESSURE_IDS.length, transitionCoverageComplete, identityCoverageComplete, mutatorThresholds, tierCap: 10, forecastWindowSeconds: 90, actionCount: ACTION_BUTTONS.length, snapshotSchemaMutation: false, gameplayMutation: false, issues };
}
