import { longRunHudFocusPolicy } from './long-run-hud-focus.js';
import { mobileInputRegressionAudit } from './mobile-input-regression-audit.js';
export function auditLongRunControlHudIntegration() {
    const hours = [2, 4, 8, 12], input = mobileInputRegressionAudit(), checkpoints = [];
    for (const h of hours)
        for (const mode of ['normal', 'boss', 'mythic']) {
            const p = longRunHudFocusPolicy(h * 3600, mode !== 'normal', mode === 'mythic');
            checkpoints.push({ hours: h, mode, tier: p.tier, maxBuildLabels: p.maxBuildLabels, criticalBars: p.keepHpBar && p.keepXpBar && p.keepMeterBar, dangerTelegraphMultiplier: p.dangerTelegraphMultiplier, reachableActions: input.reachableActionCount, hingeClear: input.hingeClear, reachBurdenReduction: input.reachBurdenReduction });
        }
    const criticalBarLossCount = checkpoints.filter((c) => !c.criticalBars).length, dangerTelegraphLossCount = checkpoints.filter((c) => c.dangerTelegraphMultiplier !== 1).length, minReachableActions = Math.min(...checkpoints.map((c) => c.reachableActions)), minReachBurdenReduction = Math.min(...checkpoints.map((c) => c.reachBurdenReduction)), hingeCrossingCount = checkpoints.filter((c) => !c.hingeClear).length, issues = [];
    if (criticalBarLossCount)
        issues.push('critical-bar-loss');
    if (dangerTelegraphLossCount)
        issues.push('danger-telegraph-loss');
    if (minReachableActions !== 9)
        issues.push('action-reachability');
    if (minReachBurdenReduction < .25)
        issues.push('thumb-relief');
    if (hingeCrossingCount)
        issues.push('hinge-crossing');
    return { passed: issues.length === 0, hours, checkpoints, criticalBarLossCount, dangerTelegraphLossCount, minReachableActions, minReachBurdenReduction, hingeCrossingCount, issues };
}
