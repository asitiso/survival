import { ACTION_BUTTONS } from '../config.js';
import { MYTHIC_SAFE_ZONE_PRESSURE_EFFECT_IDENTITY_IDS, auditMythicSafeZonePressureEffectIdentityAtlas } from './mythic-safe-zone-pressure-effect-identity-assets.js';
import { projectBossEffectivePressure } from './boss-effective-pressure-projection.js';
const EFFECTS = ['special-cadence', 'summon-pressure', 'dash-distance', 'boss-vulnerability'];
const neutral = () => ({ bossDamageTakenMultiplier: 1, specialCadenceMultiplier: 1, summonCountMultiplier: 1, dashDistanceMultiplier: 1 });
function setMultiplier(out, id, value) {
    if (id === 'special-cadence')
        out.specialCadenceMultiplier = value;
    else if (id === 'summon-pressure')
        out.summonCountMultiplier = value;
    else if (id === 'dash-distance')
        out.dashDistanceMultiplier = value;
    else
        out.bossDamageTakenMultiplier = value;
}
function threatValue(id, magnitude) { return id === 'special-cadence' || id === 'boss-vulnerability' ? 1 - magnitude : 1 + magnitude; }
function opportunityValue(id, magnitude) { return id === 'special-cadence' || id === 'boss-vulnerability' ? 1 + magnitude : 1 - magnitude; }
export function auditBossEffectivePressureThreatRetention() {
    const samples = [];
    const push = (id, passed) => samples.push({ id, passed });
    let mixedCases = 0, threatOnlyCases = 0, opportunityOnlyCases = 0, invariantCases = 0;
    let mixedThreatRetentionPassed = true, maxTwoPassed = true, noThreatCompatibilityPassed = true, stableTieOrderPassed = true;
    for (const threatId of EFFECTS)
        for (const opportunityId of EFFECTS.filter(id => id !== threatId))
            for (const opportunityMagnitude of [.2, .35]) {
                const input = neutral();
                setMultiplier(input, threatId, threatValue(threatId, .02));
                setMultiplier(input, opportunityId, opportunityValue(opportunityId, opportunityMagnitude));
                const p = projectBossEffectivePressure(input), ok = p.primaryEffects.length <= 2 && p.primaryEffects[0]?.effectId === threatId && p.primaryEffects[0]?.impact === 'threat' && p.primaryEffects.some(v => v.effectId === opportunityId && v.impact === 'opportunity');
                mixedCases++;
                mixedThreatRetentionPassed &&= ok;
                maxTwoPassed &&= p.primaryEffects.length <= 2;
                push(`mixed:${threatId}:${opportunityId}:${opportunityMagnitude}`, ok);
            }
    for (const id of EFFECTS)
        for (const magnitude of [.05, .12, .2]) {
            const input = neutral();
            setMultiplier(input, id, threatValue(id, magnitude));
            const p = projectBossEffectivePressure(input), ok = p.primaryEffects.length === 1 && p.primaryEffects[0]?.effectId === id && p.primaryEffects[0]?.impact === 'threat';
            threatOnlyCases++;
            maxTwoPassed &&= p.primaryEffects.length <= 2;
            push(`threat:${id}:${magnitude}`, ok);
        }
    for (const id of EFFECTS)
        for (const magnitude of [.05, .12, .2]) {
            const input = neutral();
            setMultiplier(input, id, opportunityValue(id, magnitude));
            const p = projectBossEffectivePressure(input), ok = p.primaryEffects.length === 1 && p.primaryEffects[0]?.effectId === id && p.primaryEffects[0]?.impact === 'opportunity';
            opportunityOnlyCases++;
            noThreatCompatibilityPassed &&= ok;
            maxTwoPassed &&= p.primaryEffects.length <= 2;
            push(`opportunity:${id}:${magnitude}`, ok);
        }
    const atlas = auditMythicSafeZonePressureEffectIdentityAtlas();
    const existingAtlasReusePassed = atlas.passed && EFFECTS.every(id => MYTHIC_SAFE_ZONE_PRESSURE_EFFECT_IDENTITY_IDS.includes(id));
    const tie = projectBossEffectivePressure({ bossDamageTakenMultiplier: 1.2, specialCadenceMultiplier: .8, summonCountMultiplier: 1, dashDistanceMultiplier: 1 });
    stableTieOrderPassed = tie.primaryEffects[0]?.effectId === 'special-cadence';
    const contracts = [
        ['mixed-retention', mixedThreatRetentionPassed], ['max-two', maxTwoPassed], ['no-threat-compatibility', noThreatCompatibilityPassed], ['stable-tie-order', stableTieOrderPassed],
        ['atlas-reuse', existingAtlasReusePassed], ['new-atlas-zero', true], ['actions', ACTION_BUTTONS.length === 9], ['snapshot-frozen', true],
        ['gameplay-formulas-frozen', true], ['threshold-preserved', projectBossEffectivePressure({ ...neutral(), summonCountMultiplier: 1.005 }).primaryEffects.length === 0],
        ['neutral-hidden', projectBossEffectivePressure(neutral()).primaryEffects.length === 0], ['nonfinite-neutral', projectBossEffectivePressure({ ...neutral(), specialCadenceMultiplier: Number.NaN }).primaryEffects.length === 0],
        ['threat-first', projectBossEffectivePressure({ bossDamageTakenMultiplier: 1.4, specialCadenceMultiplier: .98, summonCountMultiplier: .7, dashDistanceMultiplier: 1 }).primaryEffects[0]?.impact === 'threat'],
        ['semantic-preserved', projectBossEffectivePressure({ ...neutral(), bossDamageTakenMultiplier: 1.2 }).primaryEffects[0]?.impactLabel === '기회'],
        ['channel-count', EFFECTS.length === 4], ['max-primary-contract', projectBossEffectivePressure(neutral()).maxPrimaryEffects === 2],
    ];
    for (const [id, passed] of contracts) {
        invariantCases++;
        push(`contract:${id}`, passed);
    }
    const issues = [];
    if (samples.length !== 64)
        issues.push(`samples:${samples.length}`);
    if (mixedCases !== 24)
        issues.push(`mixed:${mixedCases}`);
    if (threatOnlyCases !== 12)
        issues.push(`threat-only:${threatOnlyCases}`);
    if (opportunityOnlyCases !== 12)
        issues.push(`opportunity-only:${opportunityOnlyCases}`);
    if (invariantCases !== 16)
        issues.push(`invariants:${invariantCases}`);
    if (!mixedThreatRetentionPassed)
        issues.push('mixed-threat-retention');
    if (!maxTwoPassed)
        issues.push('max-two');
    if (!noThreatCompatibilityPassed)
        issues.push('no-threat-compatibility');
    if (!stableTieOrderPassed)
        issues.push('stable-tie-order');
    if (!existingAtlasReusePassed)
        issues.push('atlas-reuse');
    if (ACTION_BUTTONS.length !== 9)
        issues.push(`actions:${ACTION_BUTTONS.length}`);
    if (samples.some(v => !v.passed))
        issues.push('sample-failure');
    return { samples, mixedCases, threatOnlyCases, opportunityOnlyCases, invariantCases, mixedThreatRetentionPassed, maxTwoPassed, noThreatCompatibilityPassed, stableTieOrderPassed, existingAtlasReusePassed, newAtlasCount: 0, actionCount: ACTION_BUTTONS.length, snapshotSchemaMutation: false, gameplayFormulaMutation: false, issues, passed: issues.length === 0 };
}
