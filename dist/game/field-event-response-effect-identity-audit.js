import { ACTION_BUTTONS } from './config.js';
import { FIELD_EVENT_SPECS, FieldEventDirector, eliteRushCount, fieldEventModifiers } from './field-events.js';
import { FIELD_EVENT_RESPONSE_IDENTITY_IDS, auditFieldEventResponseIdentityAtlas, fieldEventResponseIdentityForEvent, fieldEventResponseIdentityIcon } from './field-event-response-identity-assets.js';
import { FIELD_EVENT_EFFECT_PROFILE_IDENTITY_IDS, auditFieldEventEffectProfileIdentityAtlas, fieldEventEffectProfileIdentityForEvent, fieldEventEffectProfileIdentityIcon } from './field-event-effect-profile-identity-assets.js';
const IDS = Object.freeze(['goldenGoblin', 'supplyDrop', 'manaStorm', 'goldenNight', 'eliteRush']);
const EXPECTED = {
    goldenGoblin: { response: 'chase', effect: 'gold-bounty', duration: 22, cooldown: 1, spawn: 1, elite: 1, gold: 1 },
    supplyDrop: { response: 'retrieve', effect: 'free-supply', duration: 30, cooldown: 1, spawn: 1, elite: 1, gold: 1 },
    manaStorm: { response: 'overcast', effect: 'mana-tradeoff', duration: 25, cooldown: .68, spawn: 1.5, elite: 1, gold: 1 },
    goldenNight: { response: 'harvest', effect: 'gold-elite-tradeoff', duration: 30, cooldown: 1, spawn: 1.08, elite: .72, gold: 2 },
    eliteRush: { response: 'burst-control', effect: 'elite-pressure', duration: 14, cooldown: 1, spawn: 1.35, elite: .42, gold: 1 },
};
function sequence(values) { let i = 0; return () => values[Math.min(i++, values.length - 1)] ?? 0; }
function scheduleContractOk() {
    const first = new FieldEventDirector(() => 0);
    if (first.update(0, 74.999, 99).started !== null)
        return false;
    if (first.update(0, 75, 12).started !== null)
        return false;
    if (first.update(0, 75, 12.01).started === null)
        return false;
    const min = new FieldEventDirector(sequence([0, 0]));
    const startedMin = min.update(0, 75, 99).started;
    if (!startedMin)
        return false;
    min.completeActive(100);
    if (min.nextEventAt !== 185)
        return false;
    const max = new FieldEventDirector(sequence([0, 1]));
    const startedMax = max.update(0, 75, 99).started;
    if (!startedMax)
        return false;
    max.completeActive(100);
    return max.nextEventAt === 220;
}
export function auditFieldEventResponseEffectIdentityAssets() {
    const responseAtlas = auditFieldEventResponseIdentityAtlas(), effectAtlas = auditFieldEventEffectProfileIdentityAtlas();
    const samples = [];
    const push = (caseId, eventId, passed) => samples.push({ caseId, eventId, passed });
    let gameplayContractMutation = ACTION_BUTTONS.length !== 9;
    for (const eventId of IDS) {
        const expected = EXPECTED[eventId], responseId = fieldEventResponseIdentityForEvent(eventId), effectId = fieldEventEffectProfileIdentityForEvent(eventId), response = fieldEventResponseIdentityIcon(responseId), effect = fieldEventEffectProfileIdentityIcon(effectId), spec = FIELD_EVENT_SPECS[eventId], mods = fieldEventModifiers({ ...spec, remaining: spec.duration, startedAt: 0 });
        const checks = [
            ['response-map', responseId === expected.response && FIELD_EVENT_RESPONSE_IDENTITY_IDS.includes(responseId)],
            ['response-icon', response.id === responseId && response.maxVisibleIcons === 1],
            ['effect-map', effectId === expected.effect && FIELD_EVENT_EFFECT_PROFILE_IDENTITY_IDS.includes(effectId)],
            ['effect-icon', effect.id === effectId && effect.maxVisibleIcons === 1],
            ['duration', spec.duration === expected.duration],
            ['cooldown', mods.cooldownMultiplier === expected.cooldown],
            ['spawn-pressure', mods.spawnPressureMultiplier === expected.spawn],
            ['elite-interval', mods.eliteIntervalMultiplier === expected.elite],
            ['gold', mods.goldMultiplier === expected.gold],
            ['response-fallback', response.textFallbackPreserved && !response.loadFailureBlocksGameplay],
            ['effect-fallback', effect.textFallbackPreserved && !effect.loadFailureBlocksGameplay],
            ['static', !response.animated && response.motionAmplitude === 0 && !effect.animated && effect.motionAmplitude === 0],
        ];
        for (const [name, passed] of checks) {
            push(`${eventId}:${name}`, eventId, passed);
            if (!passed)
                gameplayContractMutation = true;
        }
    }
    const durations = IDS.map(id => FIELD_EVENT_SPECS[id].duration);
    if (durations.some((value, index) => value !== [22, 30, 25, 30, 14][index]))
        gameplayContractMutation = true;
    if (!scheduleContractOk())
        gameplayContractMutation = true;
    if (eliteRushCount(13) !== 12)
        gameplayContractMutation = true;
    const issues = [];
    if (samples.length !== 60)
        issues.push(`samples:${samples.length}`);
    if (!responseAtlas.passed)
        issues.push('response-atlas');
    if (!effectAtlas.passed)
        issues.push('effect-atlas');
    if (gameplayContractMutation)
        issues.push('gameplay-contract');
    if (ACTION_BUTTONS.length !== 9)
        issues.push('actions');
    return { samples, responseIdentityCount: FIELD_EVENT_RESPONSE_IDENTITY_IDS.length, effectIdentityCount: FIELD_EVENT_EFFECT_PROFILE_IDENTITY_IDS.length, responseCoverage: responseAtlas.coverage, effectCoverage: effectAtlas.coverage, responseUniqueCellCount: responseAtlas.uniqueCellCount, effectUniqueCellCount: effectAtlas.uniqueCellCount, eventDurations: [22, 30, 25, 30, 14], scheduleContract: { firstEventAt: 75, bossSafetyWindow: 12, minBetweenEvents: 85, maxBetweenEvents: 120 }, eliteRushMaxCount: 12, gameplayContractMutation, actionCount: ACTION_BUTTONS.length, snapshotSchemaMutation: false, issues, passed: issues.length === 0 && samples.every(sample => sample.passed) };
}
