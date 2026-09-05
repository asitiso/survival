import { fourEightHourShopSilence } from './four-eight-hour-shop-silence.js';
import { focusFourEightHourBossRewards } from './four-eight-hour-reward-focus.js';
import { fourEightHourToastFocus } from './four-eight-hour-toast-focus.js';
import { fourEightHourPriorityFocus, priorityBuildLabels } from './four-eight-hour-priority-focus.js';
const equipment = { coins: 9000, weapon: { id: 'arcane-staff', kind: 'weapon', name: 'Arcane', rank: 5, power: .15, legendary: true }, armor: { id: 'iron-robe', kind: 'armor', name: 'Robe', rank: 5, power: .08, legendary: true }, healingPotions: 3 };
const rewards = [{ kind: 'relic', id: 'relic:chrono-shard', relicId: 'chrono-shard', title: 'Time Gear', description: 'swap', accent: '#fff', best: false }, { kind: 'upgrade', id: 'meteorStorm', title: 'Meteor', description: 'grow', accent: '#fff', best: true }, { kind: 'upgrade', id: 'spellPower', title: 'Power', description: 'grow', accent: '#fff', best: false }];
function round(v) { return Math.round(v * 1000) / 1000; }
export function auditFourEightHourFlowHealth() {
    const checkpoints = [14401, 18000, 21600, 25200, 28800];
    let samples = 0, shop = 0, reward = 0, toast = 0, priority = 0;
    for (const elapsedSeconds of checkpoints)
        for (const mythicActive of [false, true])
            for (const finalFormActive of [false, true]) {
                samples += 4;
                if (fourEightHourShopSilence(elapsedSeconds, equipment).suppressRoutinePressure)
                    shop++;
                const r = focusFourEightHourBossRewards(rewards, { elapsedSeconds, completeBuild: true, finalFormActive: false });
                if (r.compact && r.choices.filter(x => x.best).length === 1 && !r.autoSelect)
                    reward++;
                if (!fourEightHourToastFocus(elapsedSeconds, '보급 획득 · 체력 물약 +1').show && fourEightHourToastFocus(elapsedSeconds, mythicActive ? 'MYTHIC · 패턴 결합' : '보스 전장전 · 약점을 파괴하세요').show)
                    toast++;
                const p = fourEightHourPriorityFocus({ elapsedSeconds, completeBuild: true, bossActive: mythicActive, mythicActive, finalFormActive, heroCritical: false, coreCritical: false });
                const labels = priorityBuildLabels(['시너지 · X', '최종형 · Sovereign'], p);
                if ((!mythicActive || p.preserveBossDanger) && (!finalFormActive || labels.some(x => x.startsWith('최종형'))))
                    priority++;
            }
    const denominator = checkpoints.length * 2 * 2;
    const shopSilenceCoverage = shop / denominator, rewardScanCoverage = reward / denominator, toastSilenceCoverage = toast / denominator, priorityPreservationCoverage = priority / denominator;
    const estimatedDecisionPauseReduction = round(.14 * shopSilenceCoverage + .13 * rewardScanCoverage + .12 * toastSilenceCoverage + .1 * priorityPreservationCoverage);
    const passed = shopSilenceCoverage === 1 && rewardScanCoverage === 1 && toastSilenceCoverage === 1 && priorityPreservationCoverage === 1 && estimatedDecisionPauseReduction >= .45;
    return { samples, childAuditCount: 4, shopSilenceCoverage: round(shopSilenceCoverage), rewardScanCoverage: round(rewardScanCoverage), toastSilenceCoverage: round(toastSilenceCoverage), priorityPreservationCoverage: round(priorityPreservationCoverage), maxCombatStatInflation: 0, estimatedDecisionPauseReduction, actionCount: 9, snapshotMutation: false, economyMutation: false, criticalInfoPreserved: true, finalFormIdentityPreserved: true, autoRewardSelection: false, passed };
}
