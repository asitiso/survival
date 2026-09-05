import { bossActionAssist, bossResponseActions } from './boss-action-assist.js';
const ARCHETYPES = ['inferno', 'summoner', 'juggernaut', 'abyssWitch', 'twinMaw', 'timeEater'];
function round4(v) { return Math.round(v * 10000) / 10000; }
export function auditBossActionAssist() {
    const samples = [];
    let responseExpected = 0, responseHit = 0, potionExpected = 0, potionHit = 0, earlyFalsePromptCount = 0, multiActionViolations = 0;
    for (const archetype of ARCHETYPES) {
        const mapped = bossResponseActions(archetype);
        const readySets = [['all', new Set(['spell1', 'spell2', 'spell3', 'spell4', 'ultimate1', 'ultimate2'])], ['first', new Set([mapped[0]])], ['second', new Set([mapped[1], mapped[2]])], ['none', new Set()]];
        for (const [caseId, readyActions] of readySets) {
            const expected = readyActions.size > 0;
            const cue = bossActionAssist({ archetype, specialTimer: .55, hpRatio: .8, potions: 0, readyActions });
            samples.push({ archetype, caseId, expected, actual: Boolean(cue), actionId: cue?.actionId ?? null });
            if (expected) {
                responseExpected++;
                if (cue)
                    responseHit++;
            }
            if (cue && ![...readyActions].includes(cue.actionId))
                multiActionViolations++;
        }
        const rescue = bossActionAssist({ archetype, specialTimer: .45, hpRatio: .25, potions: 1, readyActions: new Set(['potion']) });
        potionExpected++;
        if (rescue?.actionId === 'potion')
            potionHit++;
        samples.push({ archetype, caseId: 'potion', expected: true, actual: Boolean(rescue), actionId: rescue?.actionId ?? null });
        const early = bossActionAssist({ archetype, specialTimer: 1.4, hpRatio: .2, potions: 1, readyActions: new Set(['potion', mapped[0]]) });
        if (early)
            earlyFalsePromptCount++;
        samples.push({ archetype, caseId: 'early', expected: false, actual: Boolean(early), actionId: early?.actionId ?? null });
        const boundary = bossActionAssist({ archetype, specialTimer: 1.0, hpRatio: .8, potions: 0, readyActions: new Set(mapped) });
        responseExpected++;
        if (boundary)
            responseHit++;
        samples.push({ archetype, caseId: 'boundary', expected: true, actual: Boolean(boundary), actionId: boundary?.actionId ?? null });
        const critical = bossActionAssist({ archetype, specialTimer: .2, hpRatio: .8, potions: 0, readyActions: new Set(mapped) });
        responseExpected++;
        if (critical)
            responseHit++;
        samples.push({ archetype, caseId: 'critical', expected: true, actual: Boolean(critical), actionId: critical?.actionId ?? null });
    }
    const responseCoverage = round4(responseHit / Math.max(1, responseExpected)), potionRescueCoverage = round4(potionHit / Math.max(1, potionExpected));
    const issues = [];
    if (responseCoverage < .98)
        issues.push('response-coverage');
    if (potionRescueCoverage < .99)
        issues.push('potion-rescue');
    if (earlyFalsePromptCount)
        issues.push('early-false-prompts');
    if (multiActionViolations)
        issues.push('invalid-action');
    return { passed: issues.length === 0, archetypeCount: ARCHETYPES.length, samples, responseCoverage, potionRescueCoverage, earlyFalsePromptCount, multiActionViolations, issues };
}
