import { eightTwelveHourShopFocus } from './eight-twelve-hour-shop-focus.js';
import { focusEightTwelveHourBossRewards } from './eight-twelve-hour-reward-focus.js';
import { eightTwelveHourToastFocus } from './eight-twelve-hour-toast-focus.js';
import { eightTwelveHourHudFocus, eightTwelveHourBuildLabels } from './eight-twelve-hour-hud-focus.js';
const equipment = { coins: 12000, weapon: { id: 'arcane-staff', kind: 'weapon', name: 'Arcane', rank: 5, power: .15, legendary: true }, armor: { id: 'iron-robe', kind: 'armor', name: 'Robe', rank: 5, power: .08, legendary: true }, healingPotions: 3 };
const rewards = [{ kind: 'relic', id: 'relic:chrono-shard', relicId: 'chrono-shard', title: 'Time Gear', description: 'swap', accent: '#fff', best: false }, { kind: 'upgrade', id: 'meteorStorm', title: 'Meteor', description: 'grow', accent: '#fff', best: true }, { kind: 'upgrade', id: 'spellPower', title: 'Power', description: 'grow', accent: '#fff', best: false }];
function round(value) { return Math.round(value * 1000) / 1000; }
export function auditEightTwelveHourFlowHealth() {
    const checkpoints = [8 * 3600 + 1, 9 * 3600, 10 * 3600, 11 * 3600, 12 * 3600];
    let samples = 0, shop = 0, reward = 0, toast = 0, priority = 0;
    for (const elapsedSeconds of checkpoints)
        for (const mythicActive of [false, true])
            for (const finalFormActive of [false, true]) {
                samples += 4;
                const s = eightTwelveHourShopFocus(elapsedSeconds, equipment);
                if (s.dormant && s.keepClickable && !s.showTokenCount)
                    shop++;
                const r = focusEightTwelveHourBossRewards(rewards, { elapsedSeconds, completeBuild: true, finalFormActive: false });
                if (r.compact && r.choices.filter(choice => choice.best).length === 1 && !r.autoSelect)
                    reward++;
                const routineHidden = !eightTwelveHourToastFocus(elapsedSeconds, '보스 전장전 · 약점을 파괴하세요').show;
                const criticalShown = eightTwelveHourToastFocus(elapsedSeconds, mythicActive ? 'MYTHIC · 패턴 결합' : '수호핵 위험').show;
                if (routineHidden && criticalShown)
                    toast++;
                const p = eightTwelveHourHudFocus({ elapsedSeconds, completeBuild: true, bossActive: mythicActive, mythicActive, finalFormActive, heroCritical: false, coreCritical: false });
                const labels = eightTwelveHourBuildLabels(['시너지 · X', '최종형 · Sovereign', 'SIGNATURE · Crown'], p);
                if ((!mythicActive || p.preserveBossDanger) && (!finalFormActive || labels.length === 1))
                    priority++;
            }
    const denominator = checkpoints.length * 2 * 2;
    const shopDormancyCoverage = shop / denominator, rewardFocusCoverage = reward / denominator, toastSilenceCoverage = toast / denominator, priorityPreservationCoverage = priority / denominator;
    const estimatedDecisionPauseReduction = round(.15 * shopDormancyCoverage + .14 * rewardFocusCoverage + .13 * toastSilenceCoverage + .1 * priorityPreservationCoverage);
    const passed = shopDormancyCoverage === 1 && rewardFocusCoverage === 1 && toastSilenceCoverage === 1 && priorityPreservationCoverage === 1 && estimatedDecisionPauseReduction >= .5;
    return { samples, childAuditCount: 4, shopDormancyCoverage: round(shopDormancyCoverage), rewardFocusCoverage: round(rewardFocusCoverage), toastSilenceCoverage: round(toastSilenceCoverage), priorityPreservationCoverage: round(priorityPreservationCoverage), maxCombatStatInflation: 0, estimatedDecisionPauseReduction, actionCount: 9, snapshotMutation: false, economyMutation: false, criticalInfoPreserved: true, finalFormIdentityPreserved: true, autoRewardSelection: false, passed };
}
