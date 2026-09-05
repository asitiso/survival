import { ACTION_BUTTONS } from './config.js';
import { lastLawSafeZoneLifecycle } from './endless/last-law-safe-zone-lifecycle.js';
import { mythicSafeZoneDamageMultiplier, mythicSafeZoneState } from './endless/mythic-safe-zone.js';
import { safeLaneForecast } from './endless/safe-lane-forecast.js';
import { safeTelegraphTimeline } from './endless/safe-telegraph-timeline.js';
import { MYTHIC_SAFE_ZONE_LIFECYCLE_IDENTITY_IDS, auditMythicSafeZoneLifecycleIdentityAtlas, mythicSafeZoneLifecycleIdentityIcon } from './endless/mythic-safe-zone-lifecycle-identity-assets.js';
import { SAFE_ZONE_TRANSITION_DIRECTION_IDS, auditSafeZoneTransitionDirectionAtlas, safeZoneTransitionDirectionFromVector, safeZoneTransitionDirectionIcon } from './endless/safe-zone-transition-direction-assets.js';
const ARCHETYPES = ['inferno', 'summoner', 'juggernaut', 'abyssWitch', 'twinMaw', 'timeEater'];
const PHASE_TIMES = { stable: 1000, collapse: 5000, collapsed: 7000, reform: 8200 };
const BASE_RADIUS = { inferno: 82, summoner: 96, juggernaut: 72, abyssWitch: 86, twinMaw: 78, timeEater: 88 };
const SCALE = { stable: 1, collapse: .72, collapsed: .58, reform: .64 };
const DAMAGE = { stable: .18, collapse: .58, collapsed: 1, reform: .34 };
const DIRECTION_CASES = [[0, -10, 'N'], [10, -10, 'NE'], [10, 0, 'E'], [10, 10, 'SE'], [0, 10, 'S'], [-10, 10, 'SW'], [-10, 0, 'W'], [-10, -10, 'NW']];
function close(a, b) { return Math.abs(a - b) < 1e-9; }
function expectedRadius(archetype, phase) { return Math.max(48, Math.min(150, BASE_RADIUS[archetype] * SCALE[phase])); }
function timelineStage(transitionMs) { const forecast = { label: 'SAFE FORECAST', phase: 'stable', currentTarget: { x: 300, y: 300 }, nextTarget: { x: 500, y: 300 }, urgency: 0, transitionMs, autoMove: false }; return safeTelegraphTimeline(forecast, [], 18)?.stage ?? 'none'; }
export function auditSafeZoneLifecycleDirectionIdentityAssets() {
    const lifecycleAtlas = auditMythicSafeZoneLifecycleIdentityAtlas(), directionAtlas = auditSafeZoneTransitionDirectionAtlas();
    const lifecycle = lastLawSafeZoneLifecycle(false, 0);
    const timelineContract = timelineStage(1101) === 'hold' && timelineStage(1100) === 'prepare' && timelineStage(521) === 'prepare' && timelineStage(520) === 'move' && timelineStage(221) === 'move' && timelineStage(220) === 'critical';
    const lifecycleTimingStable = lifecycle.cycleMs === 9000 && lifecycle.stableEndMs === 4800 && lifecycle.collapseEndMs === 6200 && lifecycle.collapsedEndMs === 7800 && lifecycle.reformEndMs === 9000 && lifecycle.radiusMultiplier === 1;
    const directionResults = DIRECTION_CASES.map(([dx, dy, id]) => safeZoneTransitionDirectionFromVector(dx, dy) === id);
    const forecastDirectionCoverage = directionResults.filter(Boolean).length / DIRECTION_CASES.length;
    const samples = [];
    const push = (caseId, archetype, passed) => samples.push({ caseId, archetype, passed });
    let gameplayContractMutation = !timelineContract || !lifecycleTimingStable || forecastDirectionCoverage !== 1 || ACTION_BUTTONS.length !== 9;
    for (const archetype of ARCHETYPES) {
        for (const phase of MYTHIC_SAFE_ZONE_LIFECYCLE_IDENTITY_IDS) {
            const icon = mythicSafeZoneLifecycleIdentityIcon(phase);
            push(`${archetype}:icon:${phase}`, archetype, icon.phase === phase && icon.safeZoneLabelCompanion && icon.maxVisibleIcons === 1 && !icon.animated && icon.motionAmplitude === 0);
        }
        for (const phase of MYTHIC_SAFE_ZONE_LIFECYCLE_IDENTITY_IDS) {
            const state = mythicSafeZoneState(archetype, PHASE_TIMES[phase], 1600, 900, 0, lifecycle);
            const point = state.phase === 'collapsed' ? state.nextCenter : state.center;
            const runtime = state.phase === phase && close(state.radius, expectedRadius(archetype, phase)) && close(mythicSafeZoneDamageMultiplier(state, point), DAMAGE[phase]);
            push(`${archetype}:runtime:${phase}`, archetype, runtime);
            if (!runtime)
                gameplayContractMutation = true;
        }
        const zone = mythicSafeZoneState(archetype, 5000, 1600, 900, 0, lifecycle), lane = { label: 'SAFE LANE', target: { ...zone.center }, confidence: .8, score: 100 };
        const forecast = safeLaneForecast(lane, zone, 5000);
        const forecastStable = Boolean(forecast && forecast.urgency === .72 && forecast.autoMove === false && safeZoneTransitionDirectionIcon(safeZoneTransitionDirectionFromVector(forecast.nextTarget.x - forecast.currentTarget.x, forecast.nextTarget.y - forecast.currentTarget.y)).forecastUrgencyThreshold === .65);
        push(`${archetype}:forecast`, archetype, forecastStable);
        if (!forecastStable)
            gameplayContractMutation = true;
        const freeze = timelineContract && lifecycleTimingStable && ACTION_BUTTONS.length === 9 && SAFE_ZONE_TRANSITION_DIRECTION_IDS.length === 8;
        push(`${archetype}:freeze`, archetype, freeze);
        if (!freeze)
            gameplayContractMutation = true;
    }
    const issues = [];
    if (samples.length !== 60)
        issues.push(`samples:${samples.length}`);
    if (!lifecycleAtlas.passed)
        issues.push('lifecycle-atlas');
    if (!directionAtlas.passed)
        issues.push('direction-atlas');
    if (forecastDirectionCoverage !== 1)
        issues.push('direction-coverage');
    if (gameplayContractMutation)
        issues.push('gameplay-contract');
    if (ACTION_BUTTONS.length !== 9)
        issues.push('actions');
    return { samples, lifecycleIdentityCount: MYTHIC_SAFE_ZONE_LIFECYCLE_IDENTITY_IDS.length, directionIdentityCount: SAFE_ZONE_TRANSITION_DIRECTION_IDS.length, lifecycleCoverage: lifecycleAtlas.coverage, directionCoverage: directionAtlas.coverage, lifecycleUniqueCellCount: lifecycleAtlas.uniqueCellCount, directionUniqueCellCount: directionAtlas.uniqueCellCount, forecastDirectionCoverage, urgencyThreshold: .65, safeTimelineDecisionThresholds: [1100, 520, 220], gameplayContractMutation, actionCount: ACTION_BUTTONS.length, snapshotSchemaMutation: false, issues, passed: issues.length === 0 && samples.every(sample => sample.passed) };
}
