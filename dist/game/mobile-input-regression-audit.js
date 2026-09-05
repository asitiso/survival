import { thumbFatigueAudit } from '../core/thumb-fatigue-audit.js';
import { ACTION_BUTTONS } from './config.js';
import { landscapeSafeAreaProfile } from './landscape-safe-area.js';
import { foldableThumbTravelAudit } from './foldable-thumb-travel-audit.js';
export function mobileInputRegressionAudit() {
    const fatigue = thumbFatigueAudit();
    const profiles = [[1600, 900], [2400, 1080], [2208, 1840], [1280, 900]].map(([w, h]) => landscapeSafeAreaProfile(w, h));
    const foldable = profiles.map((p) => foldableThumbTravelAudit(p, ACTION_BUTTONS)).find((a) => a.applicable) ?? null;
    const issues = [...fatigue.issues];
    const actionCount = ACTION_BUTTONS.length;
    const reachableActionCount = foldable?.reachableActionCount ?? actionCount;
    const hingeClear = foldable?.hingeClear ?? true;
    if (actionCount !== 9)
        issues.push('action-count');
    if (reachableActionCount !== 9)
        issues.push('action-reachability');
    if (!hingeClear)
        issues.push('hinge-crossing');
    return { profiles: profiles.length, actionCount, reachableActionCount, hingeClear, dragSamples: fatigue.samples, reachBurdenReduction: fatigue.reachBurdenReduction, maxSoftReach: fatigue.maxSoftReach, actionLayoutMutation: false, issues, passed: issues.length === 0 };
}
