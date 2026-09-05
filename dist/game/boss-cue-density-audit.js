import { combatCuePriorityPolicy } from './combat-cue-priority.js';
export function auditBossCueDensity() {
    const severities = [['none', null], ['heavy', 'heavy'], ['critical', 'critical']];
    const timers = [.2, .6, 1.2, 3];
    const samples = [];
    for (const [label, severity] of severities)
        for (const timer of timers) {
            const policy = combatCuePriorityPolicy({ damageSeverity: severity, bossSpecialTimer: timer });
            const imminentSpecial = timer <= .75;
            const responseVisible = imminentSpecial;
            const damageUnits = severity ? 1 : 0, responseUnits = responseVisible ? 1 : 0, autoUnits = policy.showAutoLabel ? 1 : 0, weakpointUnits = policy.showWeakpointLabel ? 1 : 0;
            samples.push({ damageSeverity: label, bossSpecialTimer: timer, imminentSpecial, projectileCues: policy.maxProjectileCues, cueUnits: damageUnits + responseUnits + policy.maxProjectileCues + autoUnits + weakpointUnits, responseVisible });
        }
    const imminent = samples.filter((s) => s.imminentSpecial), critical = imminent.filter((s) => s.damageSeverity === 'critical');
    const maxImminentCueUnits = Math.max(...imminent.map((s) => s.cueUnits)), maxCriticalCueUnits = Math.max(...critical.map((s) => s.cueUnits)), maxProjectileCues = Math.max(...imminent.map((s) => s.projectileCues));
    const missingResponseCount = imminent.filter((s) => !s.responseVisible).length, zeroThreatWarningCount = imminent.filter((s) => s.projectileCues < 1).length;
    const issues = [];
    if (maxImminentCueUnits > 6)
        issues.push('imminent-cue-density');
    if (maxCriticalCueUnits > 4)
        issues.push('critical-cue-density');
    if (maxProjectileCues > 3)
        issues.push('projectile-density');
    if (missingResponseCount)
        issues.push('missing-response');
    if (zeroThreatWarningCount)
        issues.push('missing-projectile-warning');
    return { passed: issues.length === 0, samples, maxImminentCueUnits, maxCriticalCueUnits, maxProjectileCues, missingResponseCount, zeroThreatWarningCount, issues };
}
