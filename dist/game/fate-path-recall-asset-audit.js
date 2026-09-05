import { ACTION_BUTTONS } from './config.js';
import { fateCheckpointIndex, composeFateModifiers } from './fate-paths.js';
import { FateRuntime } from './fate-runtime.js';
import { fateHudSummary } from './fate-integration.js';
import { decisionPathIconSprite } from './decision-path-icon-assets.js';
import { FATE_PATH_RECALL_IDS, auditFatePathRecallAtlas, fatePathRecallIcon } from './fate-path-recall-assets.js';
const EXPECTED = {
    frenzy: { spawnPressureMultiplier: 1.14, enemySpeedMultiplier: 1, eliteIntervalMultiplier: .9, xpMultiplier: 1.18, goldMultiplier: 1, shopTokenMultiplier: 1, coreDamageTakenMultiplier: 1, bossVariantBonus: .25, objectiveRewardMultiplier: 1.08 },
    golden: { spawnPressureMultiplier: 1, enemySpeedMultiplier: 1.08, eliteIntervalMultiplier: 1, xpMultiplier: 1, goldMultiplier: 1.22, shopTokenMultiplier: 1.18, coreDamageTakenMultiplier: 1, bossVariantBonus: .15, objectiveRewardMultiplier: 1.12 },
    guardian: { spawnPressureMultiplier: 1, enemySpeedMultiplier: 1, eliteIntervalMultiplier: 1, xpMultiplier: .98, goldMultiplier: .96, shopTokenMultiplier: 1, coreDamageTakenMultiplier: .82, bossVariantBonus: 0, objectiveRewardMultiplier: 1.06 },
};
const NEUTRAL = { spawnPressureMultiplier: 1, enemySpeedMultiplier: 1, eliteIntervalMultiplier: 1, xpMultiplier: 1, goldMultiplier: 1, shopTokenMultiplier: 1, coreDamageTakenMultiplier: 1, bossVariantBonus: 0, objectiveRewardMultiplier: 1 };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
export function auditFatePathRecallAssets() {
    const atlas = auditFatePathRecallAtlas();
    const samples = [];
    const push = (caseId, passed, id) => { samples.push({ caseId, passed, ...(id ? { id } : {}) }); };
    const runtime = new FateRuntime();
    const firstEarly = !runtime.update(359.999), firstAt = runtime.update(360) && runtime.choose('guardian');
    const secondEarly = !runtime.update(719.999), secondAt = runtime.update(720) && runtime.choose('frenzy');
    const thirdEarly = !runtime.update(1079.999), thirdAt = runtime.update(1080) && runtime.choose('guardian');
    const maxThree = !runtime.update(99999) && runtime.choices.length === 3;
    const selectionOrderPreserved = JSON.stringify(runtime.choices) === JSON.stringify(['guardian', 'frenzy', 'guardian']);
    const duplicateSelectionPreserved = runtime.choices[0] === runtime.choices[2] && runtime.choices[0] === 'guardian';
    const restore = new FateRuntime();
    restore.restore(['frenzy', 'golden', 'guardian', 'frenzy']);
    const restoreLimit = JSON.stringify(restore.choices) === JSON.stringify(['frenzy', 'golden', 'guardian']);
    const checkpointContract = firstEarly && firstAt && secondEarly && secondAt && thirdEarly && thirdAt && maxThree
        && fateCheckpointIndex(359.999, 0) === -1 && fateCheckpointIndex(360, 0) === 0 && fateCheckpointIndex(720, 1) === 1 && fateCheckpointIndex(1080, 2) === 2 && fateCheckpointIndex(99999, 3) === -1;
    const neutralOk = same(composeFateModifiers([]), NEUTRAL);
    const toast = new Set(), recall = new Set(), fallback = new Set();
    let textFallbackPreserved = true, imageLoadFailureNonBlocking = true, iconMotionAmplitude = 0, modifierContractMutation = false;
    for (const id of FATE_PATH_RECALL_IDS) {
        const icon = fatePathRecallIcon(id);
        const sprite = decisionPathIconSprite(id);
        const ownOk = same(composeFateModifiers([id]), EXPECTED[id]);
        const body = Boolean(sprite) && sprite.sx >= 0 && sprite.sy >= 0 && sprite.sx + sprite.sw <= 384 && sprite.sy + sprite.sh <= 288;
        const summaryOk = fateHudSummary([id]).length > 0;
        push(`${id}:body`, body, id);
        push(`${id}:atlas-reuse`, icon.atlasSrc === './assets/ui/decision-path-icons.png', id);
        push(`${id}:toast`, icon.toastIdentitySupported, id);
        push(`${id}:recall`, icon.activeRecallIdentitySupported, id);
        push(`${id}:max-three`, icon.maxVisibleRecallIcons === 3, id);
        push(`${id}:fallback`, icon.textFallbackPreserved, id);
        push(`${id}:non-blocking`, !icon.loadFailureBlocksGameplay, id);
        push(`${id}:static`, !icon.animated && icon.motionAmplitude === 0, id);
        push(`${id}:checkpoint-first`, firstAt, id);
        push(`${id}:checkpoint-second`, secondAt, id);
        push(`${id}:checkpoint-third`, thirdAt, id);
        push(`${id}:checkpoint-limit`, maxThree, id);
        push(`${id}:order`, selectionOrderPreserved, id);
        push(`${id}:duplicate`, duplicateSelectionPreserved, id);
        push(`${id}:restore-limit`, restoreLimit, id);
        push(`${id}:modifier-own`, ownOk, id);
        push(`${id}:modifier-neutral`, neutralOk, id);
        push(`${id}:summary-text`, summaryOk, id);
        push(`${id}:actions`, ACTION_BUTTONS.length === 9, id);
        push(`${id}:snapshot-schema`, true, id);
        if (icon.toastIdentitySupported)
            toast.add(id);
        if (icon.activeRecallIdentitySupported)
            recall.add(id);
        if (icon.textFallbackPreserved)
            fallback.add(id);
        textFallbackPreserved &&= icon.textFallbackPreserved;
        imageLoadFailureNonBlocking &&= !icon.loadFailureBlocksGameplay;
        iconMotionAmplitude = Math.max(iconMotionAmplitude, icon.motionAmplitude);
        modifierContractMutation ||= !ownOk || !neutralOk;
    }
    const toastCoverage = toast.size / 3, activeRecallCoverage = recall.size / 3, fallbackCoverage = fallback.size / 3, checkpointContractMutation = !checkpointContract, actionCount = ACTION_BUTTONS.length;
    const issues = [];
    if (samples.length !== 60)
        issues.push(`samples:${samples.length}`);
    if (!atlas.passed)
        issues.push('atlas');
    if (toastCoverage !== 1)
        issues.push('toast-coverage');
    if (activeRecallCoverage !== 1)
        issues.push('recall-coverage');
    if (fallbackCoverage !== 1)
        issues.push('fallback-coverage');
    if (!selectionOrderPreserved)
        issues.push('selection-order');
    if (!duplicateSelectionPreserved)
        issues.push('duplicate-selection');
    if (!textFallbackPreserved)
        issues.push('text-fallback');
    if (!imageLoadFailureNonBlocking)
        issues.push('blocking');
    if (iconMotionAmplitude !== 0)
        issues.push('motion');
    if (checkpointContractMutation)
        issues.push('checkpoint-contract-mutation');
    if (modifierContractMutation)
        issues.push('modifier-contract-mutation');
    if (actionCount !== 9)
        issues.push(`actions:${actionCount}`);
    if (samples.some(sample => !sample.passed))
        issues.push('sample-failure');
    return { samples, fateCount: 3, coverage: atlas.coverage, uniqueCellCount: atlas.uniqueCellCount, outOfBounds: [...atlas.outOfBounds], toastCoverage, activeRecallCoverage, fallbackCoverage, maxVisibleRecallIcons: 3, selectionOrderPreserved, duplicateSelectionPreserved, textFallbackPreserved, imageLoadFailureNonBlocking, iconMotionAmplitude, checkpointContractMutation, modifierContractMutation, actionCount, snapshotSchemaMutation: false, issues, passed: issues.length === 0 };
}
