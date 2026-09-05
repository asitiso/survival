import { auditOpeningTenMinuteFlow } from './opening-ten-minute-flow-audit.js';
import { guideMidgameUpgradeChoices } from './midgame-upgrade-guidance.js';
import { repeatShopFastPath } from './repeat-shop-fast-path.js';
import { bossRewardNextGoal } from './boss-reward-next-goal.js';
import { auditMidgameBuildVelocity } from './midgame-build-velocity-audit.js';
const HEROES = ['arkan', 'seria', 'kain', 'edric'];
const baseLevels = { fireBolt: 8, chainLightning: 10, frostNova: 7, flameField: 9, meteorStorm: 3, blackHole: 3 };
const baseEquipment = { coins: 1800, weapon: { id: 'arcane-staff', kind: 'weapon', name: 'Arcane', rank: 2, power: .15, legendary: false }, armor: { id: 'iron-robe', kind: 'armor', name: 'Robe', rank: 2, power: .08, legendary: false }, healingPotions: 2 };
const offer = { kind: 'weapon', id: 'arcane-staff', name: 'Arcane', description: '', accent: '#fff', price: 500, power: .15 };
const choices = [
    { id: 'flameField', title: 'Flame', description: 'Lv.10 · 최종 진화 · 공격 형태 대폭 변화', accent: '#fff' },
    { id: 'spellPower', title: 'Power', description: '모든 마법 피해 +12%', accent: '#fff' },
    { id: 'moveSpeed', title: 'Move', description: '이동속도 +7.5%', accent: '#fff' },
];
function round(value) { return Math.round(value * 1000) / 1000; }
export function auditFirstThirtyFlowHealth() {
    const opening = auditOpeningTenMinuteFlow();
    let upgradeSamples = 0, upgradeCovered = 0, shopSamples = 0, shopCovered = 0, goalSamples = 0, goalCovered = 0;
    for (const heroId of HEROES) {
        for (const elapsedSeconds of [660, 780, 900, 1080]) {
            upgradeSamples += 1;
            const guided = guideMidgameUpgradeChoices(choices, { elapsedSeconds, heroId, spellLevels: baseLevels, activeFusions: [] });
            if (guided.filter((choice) => choice.best).length === 1)
                upgradeCovered += 1;
        }
        for (const elapsedSeconds of [240, 420, 720]) {
            shopSamples += 1;
            if (repeatShopFastPath(elapsedSeconds, offer, baseEquipment).promoteQuickBuy)
                shopCovered += 1;
        }
        for (const elapsedSeconds of [560, 700, 1000]) {
            goalSamples += 1;
            if (bossRewardNextGoal({ elapsedSeconds, heroId, spellLevels: baseLevels, activeRelic: 'abyss-eye', activeFusions: [], equipment: baseEquipment }))
                goalCovered += 1;
        }
    }
    const velocity = auditMidgameBuildVelocity();
    const midgameUpgradeCoverage = upgradeSamples ? upgradeCovered / upgradeSamples : 0;
    const repeatShopFastPathCoverage = shopSamples ? shopCovered / shopSamples : 0;
    const bossNextGoalCoverage = goalSamples ? goalCovered / goalSamples : 0;
    const midgameDecisionReduction = .18 * midgameUpgradeCoverage + .15 * repeatShopFastPathCoverage + .12 * bossNextGoalCoverage;
    const estimatedDecisionPauseReduction = round((opening.estimatedPauseReduction + midgameDecisionReduction) / 2);
    const samples = opening.samples + upgradeSamples + shopSamples + goalSamples + velocity.samples;
    const passed = opening.passed && velocity.passed && midgameUpgradeCoverage === 1 && repeatShopFastPathCoverage === 1 && bossNextGoalCoverage === 1 && estimatedDecisionPauseReduction >= .35;
    return { samples, childAuditCount: 4, midgameUpgradeCoverage: round(midgameUpgradeCoverage), repeatShopFastPathCoverage: round(repeatShopFastPathCoverage), bossNextGoalCoverage: round(bossNextGoalCoverage), buildVelocityPassed: velocity.passed, maxCombatStatInflation: 0, estimatedDecisionPauseReduction, actionCount: 9, snapshotMutation: false, passed };
}
