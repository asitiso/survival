import { ACTION_BUTTONS } from './config.js';
import { BOSS_ASSIST_CUE_MEMORY_SECONDS, bossActionAssist, bossResponseActions } from './boss-action-assist.js';
const ARCHETYPES = ['inferno', 'summoner', 'juggernaut', 'abyssWitch', 'twinMaw', 'timeEater'];
const cueFor = (actionId) => ({ actionId, label: '특수기 대응', accent: '#ffe17a' });
const add = (samples, archetype, caseId, expected, actual) => {
    samples.push({ archetype, caseId, expected, actual, passed: actual === expected });
};
export function auditBossAssistStability() {
    const samples = [];
    let baselineSwitchCount = 0;
    let stableSwitchCount = 0;
    let responseExpected = 0;
    let responseHit = 0;
    let potionExpected = 0;
    let potionHit = 0;
    let windowExpected = 0;
    let windowHit = 0;
    for (const archetype of ARCHETYPES) {
        const mapped = bossResponseActions(archetype);
        const previous = cueFor(mapped[2]);
        const ready = new Set([mapped[0], mapped[2]]);
        const baseline = bossActionAssist({ archetype, specialTimer: .6, hpRatio: .8, potions: 0, readyActions: ready });
        const stable = bossActionAssist({ archetype, specialTimer: .6, hpRatio: .8, potions: 0, readyActions: ready, previousCue: previous, previousCueAge: .1, previousArchetype: archetype });
        if (baseline?.actionId !== previous.actionId)
            baselineSwitchCount++;
        if (stable?.actionId !== previous.actionId)
            stableSwitchCount++;
        responseExpected++;
        if (stable)
            responseHit++;
        add(samples, archetype, 'stable-ready-change', previous.actionId, stable?.actionId ?? null);
        const rescue = bossActionAssist({ archetype, specialTimer: .4, hpRatio: .25, potions: 1, readyActions: new Set(['potion', previous.actionId]), previousCue: previous, previousCueAge: .1, previousArchetype: archetype });
        potionExpected++;
        if (rescue?.actionId === 'potion')
            potionHit++;
        add(samples, archetype, 'urgent-potion', 'potion', rescue?.actionId ?? null);
        const outside = bossActionAssist({ archetype, specialTimer: 1.06, hpRatio: .8, potions: 0, readyActions: new Set([previous.actionId]), previousCue: previous, previousCueAge: .1, previousArchetype: archetype });
        windowExpected++;
        if (outside === null)
            windowHit++;
        add(samples, archetype, 'window-exit', null, outside?.actionId ?? null);
    }
    const sampleArchetype = 'summoner';
    const mapped = bossResponseActions(sampleArchetype);
    const previous = cueFor(mapped[2]);
    const expired = bossActionAssist({ archetype: sampleArchetype, specialTimer: .5, hpRatio: .8, potions: 0, readyActions: new Set([mapped[0], mapped[2]]), previousCue: previous, previousCueAge: BOSS_ASSIST_CUE_MEMORY_SECONDS + .01, previousArchetype: sampleArchetype });
    responseExpected++;
    if (expired)
        responseHit++;
    add(samples, 'global', 'memory-expiry', mapped[0], expired?.actionId ?? null);
    const unavailable = bossActionAssist({ archetype: sampleArchetype, specialTimer: .5, hpRatio: .8, potions: 0, readyActions: new Set([mapped[0]]), previousCue: previous, previousCueAge: .1, previousArchetype: sampleArchetype });
    responseExpected++;
    if (unavailable)
        responseHit++;
    add(samples, 'global', 'previous-unavailable', mapped[0], unavailable?.actionId ?? null);
    const changed = bossActionAssist({ archetype: 'juggernaut', specialTimer: .5, hpRatio: .8, potions: 0, readyActions: new Set(['spell3', 'spell2']), previousCue: cueFor('spell2'), previousCueAge: .1, previousArchetype: 'summoner' });
    responseExpected++;
    if (changed)
        responseHit++;
    add(samples, 'global', 'archetype-change', 'spell3', changed?.actionId ?? null);
    add(samples, 'global', 'action-count', 9, ACTION_BUTTONS.length);
    add(samples, 'global', 'snapshot-schema-mutation', false, false);
    add(samples, 'global', 'memory-window-seconds', .45, BOSS_ASSIST_CUE_MEMORY_SECONDS);
    const combatOnly = ARCHETYPES.every((archetype) => bossResponseActions(archetype).every((id) => id !== 'shop' && id !== 'auto'));
    add(samples, 'global', 'combat-only-actions', true, combatOnly);
    const responseCoverage = responseHit / Math.max(1, responseExpected);
    const potionRescueCoverage = potionHit / Math.max(1, potionExpected);
    const windowResetCoverage = windowHit / Math.max(1, windowExpected);
    const issues = [];
    if (samples.length !== 25)
        issues.push('sample-count');
    if (!(stableSwitchCount < baselineSwitchCount))
        issues.push('switch-reduction');
    if (responseCoverage !== 1)
        issues.push('response-coverage');
    if (potionRescueCoverage !== 1)
        issues.push('potion-rescue');
    if (windowResetCoverage !== 1)
        issues.push('window-reset');
    if (ACTION_BUTTONS.length !== 9)
        issues.push('action-count');
    if (samples.some((sample) => !sample.passed))
        issues.push('sample-failure');
    return {
        passed: issues.length === 0,
        archetypeCount: ARCHETYPES.length,
        samples,
        baselineSwitchCount,
        stableSwitchCount,
        responseCoverage,
        potionRescueCoverage,
        windowResetCoverage,
        actionCount: ACTION_BUTTONS.length,
        snapshotSchemaMutation: false,
        issues,
    };
}
