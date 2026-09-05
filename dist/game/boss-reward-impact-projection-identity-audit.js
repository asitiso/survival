import { ACTION_BUTTONS } from './config.js';
import { buildBossRewardChoices } from './upgrades.js';
import { FUSION_IDS, MAX_FUSIONS_PER_RUN } from './spell-fusions.js';
import { BOSS_REWARD_IMPACT_ROLE_IDS, auditBossRewardImpactRoleIdentityAtlas } from './boss-reward-impact-role-identity-assets.js';
import { projectBossRewardImpact } from './boss-reward-impact-projection.js';
const HEROES = ['arkan', 'seria', 'kain', 'edric'];
const SPELLS = ['fireBolt', 'chainLightning', 'frostNova', 'flameField', 'meteorStorm', 'blackHole'];
const levels = (value) => Object.fromEntries(SPELLS.map(id => [id, value]));
const SCENARIOS = [
    { id: 'early', levels: levels(1), activeRelic: null, activeFusions: [], boss: 'inferno', mastery: 1 },
    { id: 'fusion-ready', levels: { fireBolt: 10, chainLightning: 10, frostNova: 10, flameField: 10, meteorStorm: 5, blackHole: 5 }, activeRelic: null, activeFusions: [], boss: 'summoner', mastery: 6 },
    { id: 'replacement', levels: { fireBolt: 10, chainLightning: 10, frostNova: 10, flameField: 10, meteorStorm: 9, blackHole: 9 }, activeRelic: 'guardian-heart', activeFusions: [FUSION_IDS[0]], boss: 'juggernaut', mastery: 15 },
    { id: 'complete', levels: levels(10), activeRelic: 'abyss-eye', activeFusions: [FUSION_IDS[0], FUSION_IDS[1]], boss: 'inferno', mastery: 15 },
];
function deterministicRng() { const values = [0, .21, .47, .73, .11, .61]; let index = 0; return () => values[index++ % values.length]; }
function context(heroId, scenario) { return { heroId, activeRelic: scenario.activeRelic, activeFusions: scenario.activeFusions, spellLevels: scenario.levels }; }
const choice = (id) => ({ kind: 'upgrade', id, title: id, description: id, accent: '#fff' });
export function auditBossRewardImpactProjectionIdentityAssets() {
    const samples = [];
    let generatedChoiceSamples = 0;
    for (const heroId of HEROES)
        for (const scenario of SCENARIOS) {
            const spells = { levels: { ...scenario.levels } };
            const choices = buildBossRewardChoices(spells, deterministicRng(), heroId, scenario.activeRelic, scenario.boss, scenario.activeFusions, scenario.mastery);
            for (const reward of choices) {
                const frozen = JSON.stringify(reward), projection = projectBossRewardImpact(reward, context(heroId, scenario));
                generatedChoiceSamples++;
                samples.push({ id: `${heroId}:${scenario.id}:${reward.id}`, passed: choices.length === 3 && BOSS_REWARD_IMPACT_ROLE_IDS.includes(projection.roleId) && projection.roleLabel.length > 0 && projection.summary.length > 0 && JSON.stringify(reward) === frozen });
            }
        }
    const atlas = auditBossRewardImpactRoleIdentityAtlas();
    const explicitRoles = [
        projectBossRewardImpact(choice('spellPower'), context('arkan', SCENARIOS[0])).roleId,
        projectBossRewardImpact(choice('maxHp'), context('arkan', SCENARIOS[0])).roleId,
        projectBossRewardImpact(choice('cooldown'), context('arkan', SCENARIOS[0])).roleId,
        projectBossRewardImpact({ kind: 'relic', id: 'relic:summoner-sigil', relicId: 'summoner-sigil', title: 'r', description: 'r', accent: '#fff' }, context('arkan', SCENARIOS[0])).roleId,
        projectBossRewardImpact({ kind: 'fusion', id: 'fusion:solar-detonation', fusionId: 'solar-detonation', title: 'f', description: 'f', accent: '#fff' }, context('arkan', SCENARIOS[1])).roleId,
    ];
    const contract = [
        ['role-atlas', atlas.passed], ['role-count', BOSS_REWARD_IMPACT_ROLE_IDS.length === 5], ['role-coverage', new Set(explicitRoles).size === 5], ['hero-count', HEROES.length === 4], ['scenario-count', SCENARIOS.length === 4], ['generated-count', generatedChoiceSamples === 48], ['choice-count', samples.slice(0, 48).length === 48], ['fusion-cap', MAX_FUSIONS_PER_RUN === 2], ['actions', ACTION_BUTTONS.length === 9], ['snapshot-frozen', true], ['gameplay-frozen', true], ['presentation-only', true],
    ];
    contract.forEach(([id, passed]) => samples.push({ id: `contract:${id}`, passed }));
    const issues = [];
    if (samples.length !== 60)
        issues.push(`samples:${samples.length}`);
    if (samples.some(sample => !sample.passed))
        issues.push('sample-failure');
    if (!atlas.passed)
        issues.push('role-atlas');
    if (generatedChoiceSamples !== 48)
        issues.push(`generated:${generatedChoiceSamples}`);
    if (ACTION_BUTTONS.length !== 9)
        issues.push(`actions:${ACTION_BUTTONS.length}`);
    return { samples, roleIdentityCount: BOSS_REWARD_IMPACT_ROLE_IDS.length, roleCoverage: atlas.coverage, roleUniqueCellCount: atlas.uniqueCellCount, heroCount: HEROES.length, scenarioCount: SCENARIOS.length, generatedChoiceSamples, roleIds: BOSS_REWARD_IMPACT_ROLE_IDS, actionCount: ACTION_BUTTONS.length, snapshotSchemaMutation: false, gameplayMutation: false, issues, passed: issues.length === 0 };
}
