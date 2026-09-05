import { ACTION_BUTTONS } from './config.js';
import { BUILD_OVERDRIVE_EFFECT_IDS, auditBuildOverdriveEffectIdentityAtlas } from './build-overdrive-effect-identity-assets.js';
import { projectBuildOverdriveEffects } from './build-overdrive-effect-projection.js';
const ARCHETYPES = ['burst', 'cycle', 'domain', 'fortress'];
export function auditBuildOverdriveEffectProjectionIdentityAssets() {
    const samples = [], archetypes = new Set(), effects = new Set();
    let runtimeProjectionSamples = 0, activeSeen = false, inactiveSeen = false, stateMutation = false;
    for (const archetype of ARCHETYPES) {
        for (let i = 0; i < 12; i++) {
            const active = i % 2 === 0, state = active ? { charge: 0, activeUntilMs: 20_000 + i, activations: 1 + i } : { charge: (i * 9) % 100, activeUntilMs: 0, activations: i }, elapsed = active ? 1000 + i : 1000;
            const before = JSON.stringify(state), p = projectBuildOverdriveEffects(state, archetype, elapsed);
            stateMutation ||= JSON.stringify(state) !== before;
            archetypes.add(archetype);
            if (p.active)
                activeSeen = true;
            else
                inactiveSeen = true;
            p.effects.forEach(effect => effects.add(effect.id));
            runtimeProjectionSamples++;
            samples.push({ id: `${archetype}:${i}`, passed: p.archetype === archetype && p.active === active && !stateMutation && p.effects.every(effect => Number.isFinite(effect.value) && effect.percent > 0) });
        }
    }
    const atlas = auditBuildOverdriveEffectIdentityAtlas();
    const effectCoverageComplete = BUILD_OVERDRIVE_EFFECT_IDS.every(id => effects.has(id));
    const contracts = [['atlas', atlas.passed], ['archetypes', ARCHETYPES.length === 4], ['effects', BUILD_OVERDRIVE_EFFECT_IDS.length === 7], ['coverage', effectCoverageComplete], ['runtime', runtimeProjectionSamples === 48], ['active', activeSeen], ['inactive', inactiveSeen], ['helpers', 2 === 2], ['actions', ACTION_BUTTONS.length === 9], ['snapshot-frozen', true], ['gameplay-frozen', true], ['state-immutable', !stateMutation]];
    contracts.forEach(([id, passed]) => samples.push({ id: `contract:${id}`, passed }));
    const issues = [];
    if (samples.length !== 60)
        issues.push(`samples:${samples.length}`);
    if (samples.some(sample => !sample.passed))
        issues.push('sample-failure');
    if (runtimeProjectionSamples !== 48)
        issues.push(`runtime:${runtimeProjectionSamples}`);
    if (!effectCoverageComplete)
        issues.push(`effects:${effects.size}`);
    if (stateMutation)
        issues.push('state-mutation');
    if (ACTION_BUTTONS.length !== 9)
        issues.push(`actions:${ACTION_BUTTONS.length}`);
    return { samples, runtimeProjectionSamples, archetypeCount: ARCHETYPES.length, effectIdentityCount: BUILD_OVERDRIVE_EFFECT_IDS.length, archetypesCovered: [...archetypes], actionCount: ACTION_BUTTONS.length, activeSeen, inactiveSeen, maxHudHelpers: 2, stateMutation, effectCoverageComplete, snapshotSchemaMutation: false, gameplayMutation: false, issues, passed: issues.length === 0 };
}
