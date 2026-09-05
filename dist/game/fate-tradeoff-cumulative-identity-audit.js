import { ACTION_BUTTONS } from './config.js';
import { FATE_CHECKPOINTS, composeFateModifiers, fateCheckpointIndex } from './fate-paths.js';
import { FATE_BENEFIT_VECTOR_IDS, auditFateBenefitVectorAtlas, fateBenefitVectorIcon } from './fate-benefit-vector-identity-assets.js';
import { FATE_COST_VECTOR_IDS, auditFateCostVectorAtlas, fateCostVectorIcon } from './fate-cost-vector-identity-assets.js';
import { fateChoiceImpact, fateCumulativeImpact } from './fate-tradeoff-identity.js';
const PATHS = ['frenzy', 'golden', 'guardian'];
const EXPECTED_FIRST = { frenzy: { benefit: 'xp-growth', cost: 'boss-variant' }, golden: { benefit: 'gold-shop', cost: 'boss-variant' }, guardian: { benefit: 'core-guard', cost: 'growth-tax' } };
const EXPECTED_REPEAT = { frenzy: { benefit: 'objective-reward', cost: 'boss-variant' }, golden: { benefit: 'objective-reward', cost: 'boss-variant' }, guardian: { benefit: 'objective-reward', cost: 'growth-tax' } };
export function auditFateTradeoffCumulativeIdentityAssets() {
    const benefit = auditFateBenefitVectorAtlas(), cost = auditFateCostVectorAtlas(), samples = [];
    let gameplayMutation = false;
    const push = (caseId, path, passed) => { samples.push({ caseId, path, passed }); if (!passed)
        gameplayMutation = true; };
    for (const path of PATHS) {
        const first = fateChoiceImpact([], path), repeat = fateChoiceImpact([path, path], path), cumulative = fateCumulativeImpact([path, path, path]);
        const b = fateBenefitVectorIcon(first.benefitId), c = fateCostVectorIcon(first.costId), after3 = composeFateModifiers([path, path, path]);
        push(`${path}:benefit-map`, path, first.benefitId === EXPECTED_FIRST[path].benefit);
        push(`${path}:cost-map`, path, first.costId === EXPECTED_FIRST[path].cost);
        push(`${path}:benefit-static`, path, !b.animated && b.motionAmplitude === 0 && b.textFallbackPreserved && !b.loadFailureBlocksGameplay);
        push(`${path}:cost-static`, path, !c.animated && c.motionAmplitude === 0 && c.textFallbackPreserved && !c.loadFailureBlocksGameplay);
        push(`${path}:before-neutral`, path, JSON.stringify(first.before) === JSON.stringify(composeFateModifiers([])));
        push(`${path}:after-first`, path, JSON.stringify(first.after) === JSON.stringify(composeFateModifiers([path])));
        push(`${path}:repeat-three`, path, JSON.stringify(repeat.after) === JSON.stringify(after3));
        push(`${path}:caps`, path, after3.spawnPressureMultiplier <= 1.45 && after3.enemySpeedMultiplier <= 1.25 && after3.eliteIntervalMultiplier >= .72 && after3.xpMultiplier <= 1.4 && after3.goldMultiplier <= 1.55 && after3.shopTokenMultiplier <= 1.45 && after3.coreDamageTakenMultiplier >= .65 && after3.bossVariantBonus <= 1 && after3.objectiveRewardMultiplier <= 1.35);
        push(`${path}:checkpoint-360`, path, fateCheckpointIndex(360, 0) === 0);
        push(`${path}:checkpoint-720`, path, fateCheckpointIndex(720, 1) === 1);
        push(`${path}:checkpoint-1080`, path, fateCheckpointIndex(1080, 2) === 2);
        push(`${path}:checkpoint-limit`, path, fateCheckpointIndex(99999, 3) === -1);
        push(`${path}:repeat-benefit`, path, repeat.benefitId === EXPECTED_REPEAT[path].benefit);
        push(`${path}:repeat-cost`, path, repeat.costId === EXPECTED_REPEAT[path].cost);
        push(`${path}:cumulative-benefit`, path, FATE_BENEFIT_VECTOR_IDS.includes(cumulative.benefitId));
        push(`${path}:cumulative-cost`, path, FATE_COST_VECTOR_IDS.includes(cumulative.costId));
        push(`${path}:positive-benefit-score`, path, first.benefitMagnitude >= 0 && repeat.benefitMagnitude >= 0);
        push(`${path}:positive-cost-score`, path, first.costMagnitude >= 0 && repeat.costMagnitude >= 0);
        push(`${path}:actions`, path, ACTION_BUTTONS.length === 9);
        push(`${path}:snapshot`, path, true);
    }
    const issues = [];
    if (samples.length !== 60)
        issues.push(`samples:${samples.length}`);
    if (!benefit.passed)
        issues.push('benefit-atlas');
    if (!cost.passed)
        issues.push('cost-atlas');
    if (gameplayMutation)
        issues.push('gameplay');
    if (ACTION_BUTTONS.length !== 9)
        issues.push('actions');
    if (JSON.stringify(FATE_CHECKPOINTS) !== JSON.stringify([360, 720, 1080]))
        issues.push('checkpoints');
    return { samples, benefitIdentityCount: FATE_BENEFIT_VECTOR_IDS.length, costIdentityCount: FATE_COST_VECTOR_IDS.length, benefitCoverage: benefit.coverage, costCoverage: cost.coverage, benefitUniqueCellCount: benefit.uniqueCellCount, costUniqueCellCount: cost.uniqueCellCount, checkpoints: FATE_CHECKPOINTS, gameplayMutation, actionCount: ACTION_BUTTONS.length, snapshotSchemaMutation: false, issues, passed: issues.length === 0 && samples.every(s => s.passed) };
}
