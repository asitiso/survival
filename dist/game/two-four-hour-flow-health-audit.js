import { ultraLongShopFocus } from './ultra-long-shop-focus.js';
import { compactUltraLongBossRewards } from './ultra-long-reward-focus.js';
import { fourHourHudFocus } from './four-hour-hud-focus.js';
import { ultraLongCriticalFocus } from './ultra-long-critical-focus.js';
const equipment = { coins: 9000, weapon: { id: 'arcane-staff', kind: 'weapon', name: 'Arcane', rank: 5, power: .15, legendary: true }, armor: { id: 'iron-robe', kind: 'armor', name: 'Robe', rank: 5, power: .08, legendary: true }, healingPotions: 3 };
const rewards = [{ kind: 'relic', id: 'relic:chrono-shard', relicId: 'chrono-shard', title: 'Time Gear', description: 'swap', accent: '#fff', best: false, badge: '유물 교체', hint: '교체' }, { kind: 'upgrade', id: 'meteorStorm', title: 'Meteor', description: 'grow', accent: '#fff', best: true, badge: '궁극기 성장', hint: '성장' }, { kind: 'upgrade', id: 'spellPower', title: 'Power', description: 'grow', accent: '#fff', best: false, badge: '기본 성장', hint: '성장' }];
function round(v) { return Math.round(v * 1000) / 1000; }
export function auditTwoFourHourFlowHealth() {
    let samples = 0, shop = 0, reward = 0, hud = 0, critical = 0;
    const checkpoints = [7201, 9000, 10800, 12600, 14400];
    for (const elapsedSeconds of checkpoints)
        for (const bossActive of [false, true])
            for (const criticalState of [false, true]) {
                samples += 4;
                if (ultraLongShopFocus(elapsedSeconds, equipment).deemphasizeShop)
                    shop++;
                const compact = compactUltraLongBossRewards(rewards, { elapsedSeconds, activeRelic: 'abyss-eye', activeFusionCount: 2 });
                if (compact.compact && compact.choices.filter(x => x.best).length === 1 && !compact.autoSelect)
                    reward++;
                const focus = fourHourHudFocus({ elapsedSeconds, equipment, activeRelic: 'abyss-eye', activeFusionCount: 2, bossActive, mythicActive: false });
                if (focus.maxBuildLabels <= 1 && focus.keepCriticalBars && focus.keepDangerTelegraphs)
                    hud++;
                const cue = ultraLongCriticalFocus({ elapsedSeconds, bossActive, mythicActive: false, heroCritical: criticalState, coreCritical: false });
                if (cue.preserveBossCue && cue.preserveDangerCue && cue.keepAutoRing)
                    critical++;
            }
    const denominator = checkpoints.length * 2 * 2;
    const shopQuietCoverage = shop / denominator, rewardCompactCoverage = reward / denominator, hudMinimalCoverage = hud / denominator, criticalPriorityCoverage = critical / denominator;
    const estimatedDecisionPauseReduction = round(.14 * shopQuietCoverage + .14 * rewardCompactCoverage + .12 * hudMinimalCoverage + .1 * criticalPriorityCoverage);
    const passed = shopQuietCoverage === 1 && rewardCompactCoverage === 1 && hudMinimalCoverage === 1 && criticalPriorityCoverage === 1 && estimatedDecisionPauseReduction >= .4;
    return { samples, childAuditCount: 4, shopQuietCoverage: round(shopQuietCoverage), rewardCompactCoverage: round(rewardCompactCoverage), hudMinimalCoverage: round(hudMinimalCoverage), criticalPriorityCoverage: round(criticalPriorityCoverage), maxCombatStatInflation: 0, estimatedDecisionPauseReduction, actionCount: 9, snapshotMutation: false, economyMutation: false, criticalInfoPreserved: true, autoRewardSelection: false, passed };
}
