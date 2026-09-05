import { bossBuildMatchupSamples } from './boss-build-matchup-audit.js';
import { HERO_PROFILES } from './hero-profiles.js';
function round(value) { return Math.round(value * 10000) / 10000; }
function key(sample) { return [sample.heroId, sample.relicId, [...sample.fusionIds].sort().join('+'), sample.finalFormId, sample.archetype].join('|'); }
function geometric(values) { return Math.exp(values.reduce((sum, value) => sum + Math.log(Math.max(.0001, value)), 0) / Math.max(1, values.length)); }
export function bossGauntletVersatilitySamples() {
    const matchups = bossBuildMatchupSamples();
    const heroBossTop = new Map();
    for (const sample of matchups) {
        const k = `${sample.heroId}|${sample.bossArchetype}`;
        heroBossTop.set(k, Math.max(heroBossTop.get(k) ?? 0, sample.matchupIndex));
    }
    const groups = new Map();
    for (const sample of matchups) {
        const k = key(sample);
        const list = groups.get(k) ?? [];
        list.push(sample);
        groups.set(k, list);
    }
    const out = [];
    for (const [buildKey, group] of groups) {
        const normalized = group.map((sample) => sample.matchupIndex / Math.max(.0001, heroBossTop.get(`${sample.heroId}|${sample.bossArchetype}`) ?? sample.matchupIndex));
        out.push({ heroId: group[0].heroId, buildKey, bossCount: group.length, gauntletIndex: round(geometric(group.map((sample) => sample.matchupIndex))), versatilityFloor: round(Math.min(...normalized)), versatilityAverage: round(normalized.reduce((a, b) => a + b, 0) / normalized.length) });
    }
    return out.sort((a, b) => a.buildKey.localeCompare(b.buildKey));
}
export function auditBossGauntletVersatility() {
    const samples = bossGauntletVersatilitySamples();
    const matchups = bossBuildMatchupSamples();
    const heroes = [];
    for (const hero of HERO_PROFILES) {
        const heroSamples = samples.filter((sample) => sample.heroId === hero.id).sort((a, b) => b.gauntletIndex - a.gauntletIndex);
        const best = heroSamples[0];
        const bestMatchups = matchups.filter((sample) => key(sample) === best.buildKey);
        let specialistGain = 1;
        const bosses = new Set(bestMatchups.map((sample) => sample.bossArchetype));
        for (const boss of bosses) {
            const specialist = Math.max(...matchups.filter((sample) => sample.heroId === hero.id && sample.bossArchetype === boss).map((sample) => sample.matchupIndex));
            const generalist = bestMatchups.find((sample) => sample.bossArchetype === boss).matchupIndex;
            specialistGain = Math.max(specialistGain, specialist / Math.max(.0001, generalist));
        }
        heroes.push({ heroId: hero.id, best, specialistGain: round(specialistGain) });
    }
    const minTopBuildVersatilityFloor = round(Math.min(...heroes.map((hero) => hero.best.versatilityFloor)));
    const maxSpecialistGain = round(Math.max(...heroes.map((hero) => hero.specialistGain)));
    const heroGauntletValues = heroes.map((hero) => hero.best.gauntletIndex);
    const maxHeroGauntletSpread = round(Math.max(...heroGauntletValues) / Math.max(.0001, Math.min(...heroGauntletValues)));
    const catastrophicTopBuildCount = heroes.filter((hero) => hero.best.versatilityFloor < .82).length;
    const passed = samples.length === 5760 && heroes.length === 4 && samples.every((sample) => sample.bossCount === 6) && minTopBuildVersatilityFloor >= .82 && maxSpecialistGain <= 1.18 && maxHeroGauntletSpread <= 1.18 && catastrophicTopBuildCount === 0;
    return { samples, heroes, minTopBuildVersatilityFloor, maxSpecialistGain, maxHeroGauntletSpread, catastrophicTopBuildCount, passed };
}
