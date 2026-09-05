import { ACTION_BUTTONS } from './config.js';
import { bossArchetypeForOrdinal, bossArchetypeTuning, bossVariantTierForOrdinal, bossVariantTuning } from './boss-patterns.js';
import { apexBossProfile, apexPatternPair, apexPressureModifiers } from './apex-boss.js';
import { BOSS_VARIANT_PRESSURE_IDS, auditBossVariantPressureAtlas, bossVariantPressureIcon, bossVariantTierBadge } from './boss-variant-pressure-identity-assets.js';
import { APEX_SECONDARY_PATTERN_IDS, auditApexSecondaryPatternAtlas, apexSecondaryPatternIcon } from './apex-secondary-pattern-identity-assets.js';
function ordinalFor(archetype) { for (let i = 0; i < 36; i++)
    if (bossArchetypeForOrdinal(i) === archetype)
        return i; return 0; }
export function auditVariantApexIdentityAssets() {
    const va = auditBossVariantPressureAtlas(), aa = auditApexSecondaryPatternAtlas(), samples = [];
    const push = (caseId, passed, archetype) => samples.push({ caseId, passed, archetype });
    let variantRecall = 0, apexRecall = 0, secondaryIntent = 0, mutation = false;
    for (const archetype of BOSS_VARIANT_PRESSURE_IDS) {
        const v = bossVariantPressureIcon(archetype), a = apexSecondaryPatternIcon(archetype), ordinal = ordinalFor(archetype), base = bossArchetypeTuning(archetype, 2), t1 = bossVariantTuning(base, 1), t2 = bossVariantTuning(base, 2), pair = apexPatternPair(archetype, ordinal), pressure = apexPressureModifiers(true);
        push(`${archetype}:variant-body`, v.sx >= 0 && v.sy >= 0 && v.sx + 96 <= 288 && v.sy + 96 <= 192, archetype);
        push(`${archetype}:variant-recall`, v.persistentRecallIdentitySupported, archetype);
        push(`${archetype}:variant-badge`, bossVariantTierBadge(0) === null && bossVariantTierBadge(1) === 'I' && bossVariantTierBadge(2) === 'II', archetype);
        push(`${archetype}:apex-body`, a.sx >= 0 && a.sy >= 0 && a.sx + 96 <= 288 && a.sy + 96 <= 192, archetype);
        push(`${archetype}:apex-recall`, a.persistentRecallIdentitySupported, archetype);
        push(`${archetype}:secondary-intent`, a.secondarySpecialIntentSupported, archetype);
        push(`${archetype}:variant-tier-contract`, bossVariantTierForOrdinal(0, 0) === 0 && bossVariantTierForOrdinal(0, 1) === 1 && bossVariantTierForOrdinal(0, 2) === 2, archetype);
        push(`${archetype}:variant-tuning-contract`, Math.abs(t1.specialInterval - Math.max(2.5, base.specialInterval * .90)) < 1e-9 && Math.abs(t2.specialInterval - Math.max(2.5, base.specialInterval * .80)) < 1e-9 && t1.fanProjectiles === base.fanProjectiles + 2 && t2.fanProjectiles === base.fanProjectiles + 4, archetype);
        push(`${archetype}:apex-pair-contract`, pair[0] === archetype && pair[1] !== archetype, archetype);
        push(`${archetype}:apex-pressure-contract`, pressure.specialCadenceMultiplier === .86 && pressure.projectileDensityMultiplier === 1.28 && pressure.summonCountMultiplier === 1.16 && apexBossProfile(1200, 3, 2).active, archetype);
        if (v.persistentRecallIdentitySupported)
            variantRecall++;
        if (a.persistentRecallIdentitySupported)
            apexRecall++;
        if (a.secondarySpecialIntentSupported)
            secondaryIntent++;
        if (t1.specialInterval > base.specialInterval || t2.specialInterval > t1.specialInterval || pair[1] === archetype)
            mutation = true;
    }
    const issues = [];
    if (samples.length !== 60)
        issues.push('sample-count');
    if (!va.passed)
        issues.push('variant-atlas');
    if (!aa.passed)
        issues.push('apex-atlas');
    if (variantRecall !== 6)
        issues.push('variant-recall');
    if (apexRecall !== 6)
        issues.push('apex-recall');
    if (secondaryIntent !== 6)
        issues.push('secondary-intent');
    if (mutation)
        issues.push('gameplay-contract');
    if (ACTION_BUTTONS.length !== 9)
        issues.push('actions');
    if (samples.some(s => !s.passed))
        issues.push('samples');
    return { samples, variantIdentityCount: BOSS_VARIANT_PRESSURE_IDS.length, apexIdentityCount: APEX_SECONDARY_PATTERN_IDS.length, variantCoverage: va.coverage, apexCoverage: aa.coverage, variantUniqueCellCount: va.uniqueCellCount, apexUniqueCellCount: aa.uniqueCellCount, variantRecallCoverage: variantRecall / 6, apexRecallCoverage: apexRecall / 6, secondaryIntentCoverage: secondaryIntent / 6, gameplayContractMutation: mutation, actionCount: ACTION_BUTTONS.length, snapshotSchemaMutation: false, issues, passed: issues.length === 0 };
}
