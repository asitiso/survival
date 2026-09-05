import { bossArchetypeForOrdinal } from './boss-patterns.js';
import { HERO_PROFILES } from './hero-profiles.js';
import { relicCandidates } from './relics.js';
import { FUSION_IDS } from './spell-fusions.js';
import { buildBossRewardChoices } from './upgrades.js';
const STAGES = ['early', 'fusion_ready', 'late'];
const SPELL_IDS = ['fireBolt', 'chainLightning', 'frostNova', 'flameField', 'meteorStorm', 'blackHole'];
function round(value) { return Math.round(value * 1000) / 1000; }
function spread(values) { return round(Math.max(...values) / Math.max(.0001, Math.min(...values))); }
function stateFor(stage) {
    const levels = { fireBolt: 1, chainLightning: 1, frostNova: 1, flameField: 1, meteorStorm: 1, blackHole: 1 };
    if (stage === 'fusion_ready') {
        levels.fireBolt = 10;
        levels.chainLightning = 10;
        levels.frostNova = 10;
        levels.flameField = 10;
        levels.meteorStorm = 5;
        levels.blackHole = 5;
    }
    if (stage === 'late')
        for (const id of SPELL_IDS)
            levels[id] = 10;
    return { spells: { levels }, activeFusions: stage === 'late' ? [FUSION_IDS[0], FUSION_IDS[1]] : [], masteryLevel: stage === 'late' ? 15 : stage === 'fusion_ready' ? 6 : 1 };
}
function deterministicRng() { const values = [0, .21, .47, .73, .11, .61]; let index = 0; return () => values[index++ % values.length]; }
export function bossRewardFairnessSamples() {
    const samples = [];
    for (const hero of HERO_PROFILES) {
        for (let ordinal = 0; ordinal < 6; ordinal += 1) {
            const bossArchetype = bossArchetypeForOrdinal(ordinal);
            for (const stage of STAGES) {
                const state = stateFor(stage);
                const choices = buildBossRewardChoices(state.spells, deterministicRng(), hero.id, null, bossArchetype, state.activeFusions, state.masteryLevel);
                const candidatePool = relicCandidates(hero.id, null, () => 0, bossArchetype, state.masteryLevel);
                const upgradeCount = choices.filter((choice) => choice.kind === 'upgrade').length;
                const relicCount = choices.filter((choice) => choice.kind === 'relic').length;
                const fusionCount = choices.filter((choice) => choice.kind === 'fusion').length;
                const bossRelicEligible = ordinal < 3 ? candidatePool.some((id) => id === 'inferno-heart' || id === 'summoner-sigil' || id === 'juggernaut-core') : true;
                samples.push({
                    heroId: hero.id, bossArchetype, stage, choiceCount: choices.length, upgradeCount, relicCount, fusionCount, relicCandidateCount: candidatePool.length,
                    growthAccess: upgradeCount >= 1 || fusionCount >= 1, bossRelicEligible,
                    accessScore: round(upgradeCount + relicCount + fusionCount),
                });
            }
        }
    }
    return samples;
}
export function auditBossRewardFairness() {
    const samples = bossRewardFairnessSamples();
    let maxHeroAccessSpread = 1, maxRelicPoolSpread = 1;
    for (const stage of STAGES)
        for (let ordinal = 0; ordinal < 6; ordinal += 1) {
            const boss = bossArchetypeForOrdinal(ordinal);
            const group = samples.filter((sample) => sample.stage === stage && sample.bossArchetype === boss);
            maxHeroAccessSpread = Math.max(maxHeroAccessSpread, spread(group.map((sample) => sample.accessScore)));
            maxRelicPoolSpread = Math.max(maxRelicPoolSpread, spread(group.map((sample) => sample.relicCandidateCount)));
        }
    maxHeroAccessSpread = round(maxHeroAccessSpread);
    maxRelicPoolSpread = round(maxRelicPoolSpread);
    const invalidChoiceCount = samples.filter((sample) => sample.choiceCount !== 3 || sample.relicCount !== 1 || !sample.growthAccess || (sample.stage === 'fusion_ready' ? sample.fusionCount !== 1 : sample.fusionCount !== 0)).length;
    const bossRelicAccessComplete = samples.every((sample) => sample.bossRelicEligible);
    const passed = samples.length === 72 && maxHeroAccessSpread === 1 && maxRelicPoolSpread === 1 && invalidChoiceCount === 0 && bossRelicAccessComplete;
    return { samples, maxHeroAccessSpread, maxRelicPoolSpread, invalidChoiceCount, bossRelicAccessComplete, passed };
}
