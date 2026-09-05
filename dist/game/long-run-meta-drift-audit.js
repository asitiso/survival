import { completedBuildMetaSamples } from './completed-build-meta-audit.js';
import { HERO_PROFILES } from './hero-profiles.js';
const HOURS = [2, 4, 8, 12];
const THREATS = [0, 3, 5];
function round(value) { return Math.round(value * 1000) / 1000; }
function key(sample) { return [sample.relicId, [...sample.fusionIds].sort().join('+'), sample.finalFormId, sample.archetype].join('|'); }
function concentration(values) { const counts = new Map(); for (const value of values)
    counts.set(value, (counts.get(value) ?? 0) + 1); return round(Math.max(...counts.values()) / Math.max(1, values.length)); }
function score(sample, hours) {
    const t = (hours - 2) / 10;
    const survivalWeight = .04 + .015 * t;
    const coreWeight = .02 + .01 * t;
    const economyWeight = .04 - .005 * t;
    const tempoWeight = .035 - .005 * t;
    return sample.compositeIndex * Math.pow(sample.survivalIndex, survivalWeight) * Math.pow(sample.coreGuardIndex, coreWeight) * Math.pow(sample.economyIndex, economyWeight) * Math.pow(sample.tempoIndex, tempoWeight);
}
function topBuilds(group, hours) {
    const ranked = group.map((sample) => ({ sample, score: score(sample, hours) })).sort((a, b) => b.score - a.score);
    const best = ranked[0].score;
    const threshold = .90;
    let top = ranked.filter((entry) => entry.score >= best * threshold).map((entry) => entry.sample);
    if (top.length < 24)
        top = ranked.slice(0, 24).map((entry) => entry.sample);
    return top;
}
export function longRunMetaDriftSamples() {
    const builds = completedBuildMetaSamples();
    const samples = [];
    for (const hero of HERO_PROFILES)
        for (const threat of THREATS)
            for (const hours of HOURS) {
                const group = builds.filter((sample) => sample.heroId === hero.id && sample.threat === threat);
                const top = topBuilds(group, hours);
                const fusionPairs = top.map((sample) => [...sample.fusionIds].sort().join('+'));
                samples.push({ heroId: hero.id, threat, hours, topBuildCount: top.length, uniqueRelics: new Set(top.map((sample) => sample.relicId)).size, uniqueFusionPairs: new Set(fusionPairs).size, uniqueFinalForms: new Set(top.map((sample) => sample.finalFormId)).size, uniqueArchetypes: new Set(top.map((sample) => sample.archetype)).size, relicConcentration: concentration(top.map((sample) => sample.relicId)), fusionPairConcentration: concentration(fusionPairs), finalFormConcentration: concentration(top.map((sample) => sample.finalFormId)), archetypeConcentration: concentration(top.map((sample) => sample.archetype)), buildKeys: top.map(key) });
            }
    return samples;
}
export function auditLongRunMetaDrift() {
    const samples = longRunMetaDriftSamples();
    let maxConcentrationDelta = 0, minTwoToTwelveOverlap = 1;
    for (const hero of HERO_PROFILES)
        for (const threat of THREATS) {
            const first = samples.find((sample) => sample.heroId === hero.id && sample.threat === threat && sample.hours === 2);
            const last = samples.find((sample) => sample.heroId === hero.id && sample.threat === threat && sample.hours === 12);
            for (const field of ['relicConcentration', 'fusionPairConcentration', 'finalFormConcentration', 'archetypeConcentration'])
                maxConcentrationDelta = Math.max(maxConcentrationDelta, Math.abs(first[field] - last[field]));
            const firstSet = new Set(first.buildKeys), lastSet = new Set(last.buildKeys);
            const overlap = [...firstSet].filter((id) => lastSet.has(id)).length / Math.max(1, Math.min(firstSet.size, lastSet.size));
            minTwoToTwelveOverlap = Math.min(minTwoToTwelveOverlap, overlap);
        }
    maxConcentrationDelta = round(maxConcentrationDelta);
    minTwoToTwelveOverlap = round(minTwoToTwelveOverlap);
    const maxRelicConcentration = round(Math.max(...samples.map((sample) => sample.relicConcentration)));
    const maxFusionPairConcentration = round(Math.max(...samples.map((sample) => sample.fusionPairConcentration)));
    const maxFinalFormConcentration = round(Math.max(...samples.map((sample) => sample.finalFormConcentration)));
    const maxArchetypeConcentration = round(Math.max(...samples.map((sample) => sample.archetypeConcentration)));
    const fixationCount = samples.filter((sample) => sample.uniqueRelics < 3 || sample.uniqueFusionPairs < 4 || sample.uniqueFinalForms < 2 || sample.uniqueArchetypes < 2 || sample.relicConcentration > .75 || sample.fusionPairConcentration > .65 || sample.finalFormConcentration > .75 || sample.archetypeConcentration > .75).length;
    const passed = samples.length === 48 && maxConcentrationDelta <= .20 && minTwoToTwelveOverlap >= .35 && maxRelicConcentration <= .75 && maxFusionPairConcentration <= .65 && maxFinalFormConcentration <= .75 && maxArchetypeConcentration <= .75 && fixationCount === 0;
    return { samples, maxConcentrationDelta, minTwoToTwelveOverlap, maxRelicConcentration, maxFusionPairConcentration, maxFinalFormConcentration, maxArchetypeConcentration, fixationCount, passed };
}
