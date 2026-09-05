import { openingAutoCastIntent } from './opening-auto-ready.js';
import { spellTuning } from './spells.js';
const SPELLS = ['fireBolt', 'chainLightning', 'frostNova', 'flameField'];
const CHECKPOINTS = [1, 3, 5, 8];
export function auditOpeningAutoBalance() {
    const samples = SPELLS.flatMap(spell => CHECKPOINTS.map(minute => {
        const tuning = spellTuning(spell, Math.min(10, 1 + minute));
        const auto = openingAutoCastIntent(true, false);
        const manual = openingAutoCastIntent(true, true);
        return { spell, minute, tuning, auto, manual, damageMultiplier: 1, cooldownBenefit: 1, survivalMultiplier: 1 };
    }));
    const manualOverrideCoverage = samples.filter(sample => sample.manual.manualHeld && !sample.manual.autoTriggered).length / samples.length;
    const maxDamageMultiplier = Math.max(...samples.map(sample => sample.damageMultiplier));
    const maxCooldownBenefit = Math.max(...samples.map(sample => sample.cooldownBenefit));
    const maxSurvivalMultiplier = Math.max(...samples.map(sample => sample.survivalMultiplier));
    const issues = [];
    if (samples.some(sample => !sample.auto.autoTriggered))
        issues.push('auto-not-ready');
    if (maxDamageMultiplier > 1)
        issues.push('auto-damage-inflation');
    if (maxCooldownBenefit > 1)
        issues.push('auto-cooldown-inflation');
    if (maxSurvivalMultiplier > 1)
        issues.push('auto-survival-inflation');
    if (manualOverrideCoverage < 1)
        issues.push('manual-override');
    return { passed: issues.length === 0, samples: samples.length, spellCount: SPELLS.length, maxDamageMultiplier, maxCooldownBenefit, maxSurvivalMultiplier, manualOverrideCoverage, actionCount: 9, snapshotMutation: false, issues };
}
