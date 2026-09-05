import { ACTION_BUTTONS } from './config.js';
import { advanceBuildOverdrive, createDefaultOverdriveState, overdriveModifiers } from './endless/build-overdrive.js';
import { createDefaultExtensionState, restoreExtension, serializeExtension } from './endless/snapshot.js';
import { buildOverdriveRecallPresentation, buildOverdriveReadinessSegments } from './build-overdrive-recall-assets.js';
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
export function auditBuildOverdriveReadinessRecall() {
    const samples = [];
    const push = (caseId, passed) => { samples.push({ caseId, passed }); };
    const chargeCases = [0, 12, 24, 25, 37, 49, 50, 62, 74, 75];
    const segments = new Set();
    let readinessOk = true, compactOk = true, fallbackOk = true, motionAmplitude = 0, textFallbackPreserved = true, imageLoadFailureNonBlocking = true;
    for (const charge of chargeCases) {
        const normal = buildOverdriveRecallPresentation({ charge, activeUntilMs: 0, activations: 0 }, 50_000, false);
        const compact = buildOverdriveRecallPresentation({ charge, activeUntilMs: 0, activations: 0 }, 50_000, true);
        const expected = buildOverdriveReadinessSegments(charge);
        segments.add(expected);
        const a = normal.mode === 'charging' && normal.filledSegments === expected && normal.totalSegments === 4;
        push(`charge:${charge}:readiness`, a);
        readinessOk &&= a;
        const b = normal.numericLabel === `${Math.floor(charge)}` && normal.remainingSeconds === 0;
        push(`charge:${charge}:numeric`, b);
        readinessOk &&= b;
        const c = compact.compact && compact.numericLabel === '' && compact.filledSegments === expected;
        push(`charge:${charge}:compact`, c);
        compactOk &&= c;
        const d = normal.textFallbackPreserved && !normal.loadFailureBlocksGameplay && !normal.animated && normal.motionAmplitude === 0;
        push(`charge:${charge}:fallback`, d);
        fallbackOk &&= d;
        textFallbackPreserved &&= normal.textFallbackPreserved;
        imageLoadFailureNonBlocking &&= !normal.loadFailureBlocksGameplay;
        motionAmplitude = Math.max(motionAmplitude, normal.motionAmplitude);
    }
    const activeRemaining = [12, 9, 6, 3, 1];
    let activeOk = true;
    for (const remaining of activeRemaining) {
        const now = 50_000;
        const normal = buildOverdriveRecallPresentation({ charge: 0, activeUntilMs: now + remaining * 1000, activations: 1 }, now, false);
        const compact = buildOverdriveRecallPresentation({ charge: 0, activeUntilMs: now + remaining * 1000, activations: 1 }, now, true);
        const a = normal.mode === 'active' && normal.remainingSeconds === remaining && normal.numericLabel === `OD ${remaining}s` && normal.filledSegments === 0;
        push(`active:${remaining}:countdown`, a);
        activeOk &&= a;
        const b = compact.mode === 'active' && compact.compact && compact.numericLabel === '' && compact.filledSegments === 4;
        push(`active:${remaining}:compact`, b);
        compactOk &&= b;
        const c = normal.textFallbackPreserved && !normal.loadFailureBlocksGameplay && normal.motionAmplitude === 0;
        push(`active:${remaining}:fallback`, c);
        fallbackOk &&= c;
    }
    let state = createDefaultOverdriveState();
    state = advanceBuildOverdrive(state, [{ type: 'spell_cast', spellId: 'fire' }, { type: 'spell_cast', spellId: 'fusion', fusion: true }, { type: 'enemy_killed' }, { type: 'enemy_killed', elite: true }, { type: 'boss_defeated', bossId: 'b', durationMs: 1, coreDamage: 0 }], 1_000);
    const chargeOk = state.charge === 31;
    push('contract:charge-events', chargeOk);
    const activated = advanceBuildOverdrive(state, Array.from({ length: 35 }, (_, i) => ({ type: 'spell_cast', spellId: `s${i}` })), 2_000);
    const activationOk = activated.charge === 0 && activated.activeUntilMs === 14_000 && activated.activations === 1 && same(advanceBuildOverdrive(activated, [{ type: 'boss_defeated', bossId: 'blocked', durationMs: 1, coreDamage: 0 }], 5_000), activated);
    push('contract:activation-duration-lock', activationOk);
    const modifierOk = same(overdriveModifiers(activated, 'burst', 5_000), { active: true, spellPowerMultiplier: 1.2, cooldownMultiplier: 1, areaMultiplier: 1, heroDamageTakenMultiplier: 1, coreDamageTakenMultiplier: 1, bossDamageMultiplier: 1.18, fusionPowerMultiplier: 1.08 });
    push('contract:modifier', modifierOk);
    const staleStateGuarded = buildOverdriveRecallPresentation({ charge: 88, activeUntilMs: 0, activations: 0 }, 10_000, false).mode === 'charging' && buildOverdriveRecallPresentation({ charge: 0, activeUntilMs: 22_000, activations: 1 }, 10_000, false).remainingSeconds === 12 && buildOverdriveRecallPresentation({ charge: 0, activeUntilMs: 0, activations: 1 }, 22_001, false).numericLabel === '0';
    push('presentation:stateless-stale-guard', staleStateGuarded);
    const extension = createDefaultExtensionState(31);
    const roundTrip = restoreExtension(serializeExtension(extension), 1);
    const snapshotRoundTrip = same(roundTrip, extension);
    const actionCount = ACTION_BUTTONS.length;
    push('presentation:actions-snapshot', actionCount === 9 && snapshotRoundTrip);
    const readinessCoverage = readinessOk ? 1 : 0, activeCoverage = activeOk ? 1 : 0, compactCoverage = compactOk ? 1 : 0, fallbackCoverage = fallbackOk ? 1 : 0;
    const ready = buildOverdriveRecallPresentation({ charge: 100, activeUntilMs: 0, activations: 0 }, 50_000, false);
    segments.add(ready.filledSegments);
    const readyOk = ready.mode === 'ready' && ready.filledSegments === 4;
    const segmentCoverage = segments.size === 5 ? 1 : segments.size / 5;
    const chargeContractMutation = !chargeOk, activationContractMutation = !activationOk, modifierContractMutation = !modifierOk, snapshotSchemaMutation = !snapshotRoundTrip;
    const issues = [];
    if (samples.length !== 60)
        issues.push(`samples:${samples.length}`);
    if (readinessCoverage !== 1)
        issues.push('readiness');
    if (activeCoverage !== 1)
        issues.push('active');
    if (compactCoverage !== 1)
        issues.push('compact');
    if (fallbackCoverage !== 1)
        issues.push('fallback');
    if (segmentCoverage !== 1)
        issues.push('segments');
    if (!readyOk)
        issues.push('ready');
    if (!textFallbackPreserved)
        issues.push('text-fallback');
    if (!imageLoadFailureNonBlocking)
        issues.push('blocking');
    if (motionAmplitude !== 0)
        issues.push('motion');
    if (!staleStateGuarded)
        issues.push('stale-state');
    if (chargeContractMutation)
        issues.push('charge-mutation');
    if (activationContractMutation)
        issues.push('activation-mutation');
    if (modifierContractMutation)
        issues.push('modifier-mutation');
    if (actionCount !== 9)
        issues.push(`actions:${actionCount}`);
    if (snapshotSchemaMutation)
        issues.push('snapshot-schema-mutation');
    if (samples.some(sample => !sample.passed))
        issues.push('sample-failure');
    return { samples, readinessCoverage, activeCoverage, compactCoverage, fallbackCoverage, segmentCoverage, textFallbackPreserved, imageLoadFailureNonBlocking, motionAmplitude, staleStateGuarded, chargeContractMutation, activationContractMutation, modifierContractMutation, actionCount, snapshotSchemaMutation, issues, passed: issues.length === 0 };
}
