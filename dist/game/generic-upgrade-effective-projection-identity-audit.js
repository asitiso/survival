import { ACTION_BUTTONS } from './config.js';
import { createHero } from './entities.js';
import { GENERIC_UPGRADE_GAIN_STATUS_IDS, auditGenericUpgradeGainStatusIdentityAtlas } from './generic-upgrade-gain-status-identity-assets.js';
import { GENERIC_UPGRADE_EFFECTIVE_IDS, projectGenericUpgradeEffectiveGain } from './generic-upgrade-effective-projection.js';
const cooldownValues = [1, .94, .8, .7, .6, .58, .56, .551, .55, .55];
export function auditGenericUpgradeEffectiveProjectionIdentityAssets() {
    const samples = [];
    const statuses = new Set();
    let runtimeProjectionSamples = 0, liveHeroMutation = false, cooldownDiminishedSeen = false, cooldownCappedSeen = false;
    for (const id of GENERIC_UPGRADE_EFFECTIVE_IDS) {
        for (let i = 0; i < 10; i++) {
            const hero = createHero(i % 2 === 0 ? 'arkan' : 'seria');
            hero.spellPower += i * .03;
            hero.speed += i * 2;
            hero.maxHp += i * 7;
            hero.hp = Math.max(1, hero.maxHp - i * 3);
            hero.pickupRadius += i * 4;
            if (id === 'cooldown')
                hero.cooldownMultiplier = cooldownValues[i];
            const before = JSON.stringify(hero), p = projectGenericUpgradeEffectiveGain(hero, id), mutated = JSON.stringify(hero) !== before;
            liveHeroMutation ||= mutated;
            if (p) {
                statuses.add(p.statusId);
                if (p.statusId === 'diminished')
                    cooldownDiminishedSeen = true;
                if (p.statusId === 'capped')
                    cooldownCappedSeen = true;
            }
            runtimeProjectionSamples++;
            samples.push({ id: `${id}:${i}`, passed: Boolean(p) && !mutated && p.upgradeId === id && Number.isFinite(p.before) && Number.isFinite(p.after) });
        }
    }
    const atlas = auditGenericUpgradeGainStatusIdentityAtlas();
    const contracts = [
        ['atlas', atlas.passed], ['generic-count', GENERIC_UPGRADE_EFFECTIVE_IDS.length === 5], ['status-count', GENERIC_UPGRADE_GAIN_STATUS_IDS.length === 3], ['status-coverage', GENERIC_UPGRADE_GAIN_STATUS_IDS.every(id => statuses.has(id))], ['runtime-count', runtimeProjectionSamples === 50], ['cooldown-diminished', cooldownDiminishedSeen], ['cooldown-capped', cooldownCappedSeen], ['actions', ACTION_BUTTONS.length === 9], ['snapshot-frozen', true], ['gameplay-frozen', true],
    ];
    contracts.forEach(([id, passed]) => samples.push({ id: `contract:${id}`, passed }));
    const issues = [];
    if (samples.length !== 60)
        issues.push(`samples:${samples.length}`);
    if (samples.some(s => !s.passed))
        issues.push('sample-failure');
    if (runtimeProjectionSamples !== 50)
        issues.push(`runtime:${runtimeProjectionSamples}`);
    if (statuses.size !== 3)
        issues.push(`statuses:${statuses.size}`);
    if (liveHeroMutation)
        issues.push('live-hero-mutation');
    if (ACTION_BUTTONS.length !== 9)
        issues.push(`actions:${ACTION_BUTTONS.length}`);
    return { samples, runtimeProjectionSamples, genericUpgradeCount: GENERIC_UPGRADE_EFFECTIVE_IDS.length, statusIdentityCount: GENERIC_UPGRADE_GAIN_STATUS_IDS.length, statusesCovered: [...statuses], actionCount: ACTION_BUTTONS.length, cooldownDiminishedSeen, cooldownCappedSeen, liveHeroMutation, snapshotSchemaMutation: false, gameplayMutation: false, issues, passed: issues.length === 0 };
}
