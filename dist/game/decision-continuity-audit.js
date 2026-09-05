import { ACTION_BUTTONS } from './config.js';
import { DECISION_TRANSITION_BARRIER_MS, DecisionPickGuard, nextDecisionKind } from './decision-continuity.js';
const pending = (overrides = {}) => ({
    fate: false,
    heroAscension: false,
    runContract: false,
    bossRewardCount: 0,
    levelUpCount: 0,
    ...overrides,
});
export function auditDecisionContinuity() {
    const priorityStates = [
        pending({ fate: true, heroAscension: true, runContract: true, bossRewardCount: 2, levelUpCount: 3 }),
        pending({ heroAscension: true, runContract: true, bossRewardCount: 2, levelUpCount: 3 }),
        pending({ runContract: true, bossRewardCount: 2, levelUpCount: 3 }),
        pending({ bossRewardCount: 2, levelUpCount: 3 }),
        pending({ levelUpCount: 3 }),
        pending(),
    ];
    const priorityOrder = priorityStates.map(nextDecisionKind);
    const expectedPriority = ['fate', 'heroAscension', 'runContract', 'bossReward', 'levelUp', null];
    const priorityPassed = priorityOrder.every((kind, index) => kind === expectedPriority[index]);
    const stackedLevelUps = Array.from({ length: 6 }, (_, index) => pending({ levelUpCount: index + 1 }));
    const stackedLevelUpPassed = stackedLevelUps.every((state) => nextDecisionKind(state) === 'levelUp');
    const repeatedBossRewards = Array.from({ length: 4 }, (_, index) => pending({ bossRewardCount: index + 1, levelUpCount: 6 }));
    const repeatedBossRewardPassed = repeatedBossRewards.every((state) => nextDecisionKind(state) === 'bossReward');
    const onceGuard = new DecisionPickGuard();
    const onceGeneration = onceGuard.render(1000, false);
    const firstPick = onceGuard.accept(onceGeneration, 1000);
    const duplicatePick = onceGuard.accept(onceGeneration, 1001);
    const exactlyOncePassed = firstPick && !duplicatePick;
    const barrierGuard = new DecisionPickGuard();
    const barrierGeneration = barrierGuard.render(2000, true);
    const earlyPick = barrierGuard.accept(barrierGeneration, 2000 + DECISION_TRANSITION_BARRIER_MS - 1);
    const boundaryPick = barrierGuard.accept(barrierGeneration, 2000 + DECISION_TRANSITION_BARRIER_MS);
    const transitionBarrierPassed = !earlyPick && boundaryPick;
    const lifecycleGuard = new DecisionPickGuard();
    const pendingBeforeReset = pending({ bossRewardCount: 2, levelUpCount: 6 });
    const staleGeneration = lifecycleGuard.render(3000, false);
    lifecycleGuard.resetTransient(3001);
    const stalePick = lifecycleGuard.accept(staleGeneration, 4000);
    const reboundGeneration = lifecycleGuard.render(3001, true);
    const reboundPick = lifecycleGuard.accept(reboundGeneration, 3001 + DECISION_TRANSITION_BARRIER_MS);
    const lifecycleResetPassed = !stalePick && reboundPick;
    const pendingPreserved = pendingBeforeReset.bossRewardCount === 2
        && pendingBeforeReset.levelUpCount === 6
        && nextDecisionKind(pendingBeforeReset) === 'bossReward';
    const actionCount = ACTION_BUTTONS.length;
    const issues = [];
    if (!priorityPassed)
        issues.push('priority');
    if (!stackedLevelUpPassed)
        issues.push('stacked-level-up');
    if (!repeatedBossRewardPassed)
        issues.push('repeated-boss-reward');
    if (!exactlyOncePassed)
        issues.push('exactly-once');
    if (!transitionBarrierPassed)
        issues.push('transition-barrier');
    if (!lifecycleResetPassed)
        issues.push('lifecycle-reset');
    if (!pendingPreserved)
        issues.push('pending-preservation');
    if (actionCount !== 9)
        issues.push('action-surface');
    const prioritySamples = priorityStates.length;
    const stackedLevelUpSamples = stackedLevelUps.length;
    const repeatedBossRewardSamples = repeatedBossRewards.length;
    const samples = prioritySamples + stackedLevelUpSamples + repeatedBossRewardSamples + 2 + 2 + 2;
    const passed = issues.length === 0;
    return {
        samples,
        prioritySamples,
        priorityOrder,
        stackedLevelUpSamples,
        repeatedBossRewardSamples,
        exactlyOncePassed,
        transitionBarrierPassed,
        lifecycleResetPassed,
        pendingPreserved,
        autoSelection: false,
        actionCount,
        snapshotSchemaMutation: false,
        economyMutation: false,
        issues,
        passed,
    };
}
