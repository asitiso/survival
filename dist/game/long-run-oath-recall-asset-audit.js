import { ACTION_BUTTONS } from './config.js';
import { LONG_RUN_OATH_MILESTONES, advanceLongRunOaths, createDefaultLongRunOathState, longRunOathModifiers, oathHudLine } from './endless/long-run-oaths.js';
import { createDefaultExtensionState, restoreExtension, serializeExtension } from './endless/snapshot.js';
import { LONG_RUN_OATH_RECALL_IDS, auditLongRunOathRecallAtlas, longRunOathKindFromTitle, longRunOathRecallIcon, longRunOathTitle } from './long-run-oath-recall-assets.js';
const legacy = (minute, overrides = {}) => ({
    heroId: 'arkan', elapsedMs: minute * 60_000, level: 90, threat: 5, kills: 3000, bossesDefeated: 25, elitesDefeated: 100, gold: 9999, xp: 9999,
    guardianCoreHp: 1000, guardianCoreMaxHp: 1000, fate: 'frenzy', spellFusionCount: 2, mapEvolutionRank: 5, masteryLevel: 20, deviceClass: 'low', ...overrides,
});
const expectedTarget = { slayer: 200, elite_hunt: 18, boss_hunt: 2, arcane_flow: 100, core_guard: 240000, endure: 300000 };
const expectedDeadlineMinutes = { slayer: 150, elite_hunt: 150, boss_hunt: 150, arcane_flow: 150, core_guard: 124, endure: 125 };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
export function auditLongRunOathRecallAssets() {
    const atlas = auditLongRunOathRecallAtlas();
    const samples = [];
    const push = (caseId, passed, id) => { samples.push({ caseId, passed, ...(id ? { id } : {}) }); };
    const start = new Set(), active = new Set(), outcome = new Set(), fallback = new Set();
    let textFallbackPreserved = true, imageLoadFailureNonBlocking = true, iconMotionAmplitude = 0;
    for (const id of LONG_RUN_OATH_RECALL_IDS) {
        const icon = longRunOathRecallIcon(id);
        const title = longRunOathTitle(id);
        const body = icon.sx >= 0 && icon.sy >= 0 && icon.sx + icon.sw <= 672 && icon.sy + icon.sh <= 480;
        push(`${id}:body`, body, id);
        push(`${id}:atlas-reuse`, icon.atlasSrc === './assets/ui/deep-run-decision-icons.png', id);
        push(`${id}:start-toast`, icon.startToastIdentitySupported, id);
        push(`${id}:active-recall`, icon.activeRecallIdentitySupported, id);
        push(`${id}:outcome-toast`, icon.outcomeToastIdentitySupported, id);
        push(`${id}:fallback`, icon.textFallbackPreserved, id);
        push(`${id}:non-blocking`, !icon.loadFailureBlocksGameplay, id);
        push(`${id}:static`, !icon.animated && icon.motionAmplitude === 0, id);
        push(`${id}:title-roundtrip`, longRunOathKindFromTitle(title) === id, id);
        if (icon.startToastIdentitySupported)
            start.add(id);
        if (icon.activeRecallIdentitySupported)
            active.add(id);
        if (icon.outcomeToastIdentitySupported)
            outcome.add(id);
        if (icon.textFallbackPreserved)
            fallback.add(id);
        textFallbackPreserved &&= icon.textFallbackPreserved;
        imageLoadFailureNonBlocking &&= !icon.loadFailureBlocksGameplay;
        iconMotionAmplitude = Math.max(iconMotionAmplitude, icon.motionAmplitude);
    }
    const milestonesOk = same([...LONG_RUN_OATH_MILESTONES], [120, 150, 180, 240, 300, 360]);
    push('contract:milestones', milestonesOk);
    let recentChoiceOk = true;
    for (let seed = 0; seed < 12; seed++) {
        const state = { ...createDefaultLongRunOathState(), history: ['slayer', 'elite_hunt'] };
        const selected = advanceLongRunOaths(state, legacy(120), [], 0, seed).state.active?.kind ?? null;
        recentChoiceOk &&= Boolean(selected && !['slayer', 'elite_hunt'].includes(selected));
    }
    push('contract:recent-two-avoidance', recentChoiceOk);
    const seen = new Set();
    let targetDeadlineOk = true;
    for (let seed = 0; seed < 6; seed++) {
        const item = advanceLongRunOaths(createDefaultLongRunOathState(), legacy(120), [], 0, seed).state.active;
        if (!item) {
            targetDeadlineOk = false;
            continue;
        }
        seen.add(item.kind);
        targetDeadlineOk &&= item.target === expectedTarget[item.kind] && item.deadlineMs === expectedDeadlineMinutes[item.kind] * 60_000;
    }
    targetDeadlineOk &&= seen.size === 6;
    push('contract:target-deadline', targetDeadlineOk);
    const coreBase = { ...createDefaultLongRunOathState(), active: { id: 'oath-150-core_guard', milestone: 150, kind: 'core_guard', title: '수호 서약', startedAtMs: 150 * 60_000, deadlineMs: 154 * 60_000, target: 240000, progress: 0, baselineCoreHp: 1000, coreDamage: 0 } };
    const safe = advanceLongRunOaths(coreBase, legacy(151), [{ type: 'core_damaged', amount: 120 }], 0, 2);
    const failed = advanceLongRunOaths(coreBase, legacy(151), [{ type: 'core_damaged', amount: 121 }], 0, 2);
    const coreFailureOk = Boolean(safe.state.active) && !safe.effects.some(e => e.type === 'oath_failed') && failed.state.active === null && failed.effects.some(e => e.type === 'oath_failed');
    push('contract:core-damage-12pct', coreFailureOk);
    const slayer = { ...createDefaultLongRunOathState(), active: { id: 'oath-120-slayer', milestone: 120, kind: 'slayer', title: '소탕 서약', startedAtMs: 120 * 60_000, deadlineMs: 150 * 60_000, target: 1, progress: 0, baselineCoreHp: 1000, coreDamage: 0 } };
    const done = advanceLongRunOaths(slayer, legacy(121), [{ type: 'enemy_killed' }], 0, 1);
    const reward = done.effects.find(e => e.type === 'oath_completed');
    const boonModifierOk = Boolean(reward && reward.type === 'oath_completed' && reward.rewardGold === 930 && reward.coreHealPercent === .08 && done.state.boon?.expiresAtMs === 121 * 60_000 + 90_000)
        && same(longRunOathModifiers({ ...createDefaultLongRunOathState(), boon: { kind: 'prosperity', expiresAtMs: 1000 } }, 0), { goldMultiplier: 1.16, spellPowerMultiplier: 1, coreDamageTakenMultiplier: 1, bossDamageMultiplier: 1 })
        && same(longRunOathModifiers({ ...createDefaultLongRunOathState(), boon: { kind: 'power', expiresAtMs: 1000 } }, 0), { goldMultiplier: 1, spellPowerMultiplier: 1.09, coreDamageTakenMultiplier: 1, bossDamageMultiplier: 1 })
        && same(longRunOathModifiers({ ...createDefaultLongRunOathState(), boon: { kind: 'guard', expiresAtMs: 1000 } }, 0), { goldMultiplier: 1, spellPowerMultiplier: 1, coreDamageTakenMultiplier: .88, bossDamageMultiplier: 1 })
        && same(longRunOathModifiers({ ...createDefaultLongRunOathState(), boon: { kind: 'boss', expiresAtMs: 1000 } }, 0), { goldMultiplier: 1, spellPowerMultiplier: 1, coreDamageTakenMultiplier: 1, bossDamageMultiplier: 1.1 });
    push('contract:reward-boon-modifiers', boonModifierOk);
    const extension = createDefaultExtensionState(9);
    extension.oaths = { ...createDefaultLongRunOathState(), active: { id: 'oath-120-slayer', milestone: 120, kind: 'slayer', title: '소탕 서약', startedAtMs: 1, deadlineMs: 2, target: 100, progress: 44, baselineCoreHp: 1000, coreDamage: 0 } };
    const restored = restoreExtension(serializeExtension(extension), 1);
    const snapshotRoundTrip = restored.oaths.active?.kind === 'slayer' && restored.oaths.active.progress === 44 && oathHudLine(restored.oaths, 0).includes('44/100');
    const actionCount = ACTION_BUTTONS.length, snapshotSchemaMutation = !snapshotRoundTrip;
    push('contract:actions-snapshot', actionCount === 9 && snapshotRoundTrip);
    const startToastCoverage = start.size / 6, activeRecallCoverage = active.size / 6, outcomeToastCoverage = outcome.size / 6, fallbackCoverage = fallback.size / 6;
    const milestoneContractMutation = !milestonesOk, recentChoiceContractMutation = !recentChoiceOk, targetDeadlineContractMutation = !targetDeadlineOk, coreDamageFailureMutation = !coreFailureOk, boonModifierContractMutation = !boonModifierOk;
    const issues = [];
    if (samples.length !== 60)
        issues.push(`samples:${samples.length}`);
    if (!atlas.passed)
        issues.push('atlas');
    if (startToastCoverage !== 1)
        issues.push('start-toast-coverage');
    if (activeRecallCoverage !== 1)
        issues.push('active-recall-coverage');
    if (outcomeToastCoverage !== 1)
        issues.push('outcome-toast-coverage');
    if (fallbackCoverage !== 1)
        issues.push('fallback-coverage');
    if (!textFallbackPreserved)
        issues.push('text-fallback');
    if (!imageLoadFailureNonBlocking)
        issues.push('blocking');
    if (iconMotionAmplitude !== 0)
        issues.push('motion');
    if (milestoneContractMutation)
        issues.push('milestone-contract-mutation');
    if (recentChoiceContractMutation)
        issues.push('recent-choice-contract-mutation');
    if (targetDeadlineContractMutation)
        issues.push('target-deadline-contract-mutation');
    if (coreDamageFailureMutation)
        issues.push('core-damage-failure-mutation');
    if (boonModifierContractMutation)
        issues.push('boon-modifier-contract-mutation');
    if (actionCount !== 9)
        issues.push(`actions:${actionCount}`);
    if (snapshotSchemaMutation)
        issues.push('snapshot-schema-mutation');
    if (samples.some(sample => !sample.passed))
        issues.push('sample-failure');
    return { samples, oathCount: 6, coverage: atlas.coverage, uniqueCellCount: atlas.uniqueCellCount, outOfBounds: [...atlas.outOfBounds], startToastCoverage, activeRecallCoverage, outcomeToastCoverage, fallbackCoverage, maxVisibleRecallIcons: 1, textFallbackPreserved, imageLoadFailureNonBlocking, iconMotionAmplitude, milestoneContractMutation, recentChoiceContractMutation, targetDeadlineContractMutation, coreDamageFailureMutation, boonModifierContractMutation, actionCount, snapshotSchemaMutation, issues, passed: issues.length === 0 };
}
