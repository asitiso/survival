import { longRunRewardDensityPolicy } from './endless/long-run-reward-density.js';
import { completedBuildMetaSamples } from './completed-build-meta-audit.js';
import { HERO_PROFILES } from './hero-profiles.js';
import { heroThreatPressureIndex } from './hero-threat-release-audit.js';
const HOURS = [2, 4, 8, 12];
const THREATS = [0, 3, 5];
function round(value) { return Math.round(value * 10000) / 10000; }
function buildScore(sample, hours) {
    const t = (hours - 2) / 10;
    return sample.compositeIndex * Math.pow(sample.survivalIndex, .04 + .015 * t) * Math.pow(sample.coreGuardIndex, .02 + .01 * t) * Math.pow(sample.economyIndex, .04 - .005 * t) * Math.pow(sample.tempoIndex, .035 - .005 * t);
}
export function heroLongRunEfficiencySamples() {
    const builds = completedBuildMetaSamples();
    const samples = [];
    for (const hero of HERO_PROFILES)
        for (const threat of THREATS)
            for (const hours of HOURS) {
                const group = builds.filter((sample) => sample.heroId === hero.id && sample.threat === threat);
                const bestBuildScore = Math.max(...group.map((sample) => buildScore(sample, hours)));
                const pressureIndex = heroThreatPressureIndex(hours * 60, threat);
                const reward = longRunRewardDensityPolicy(hours * 3600, 0);
                const efficiencyIndex = bestBuildScore * Math.pow(reward.goldMultiplier, .04) * Math.pow(reward.xpMultiplier, .06) / Math.pow(pressureIndex, .38);
                samples.push({ heroId: hero.id, threat, hours, bestBuildScore: round(bestBuildScore), pressureIndex: round(pressureIndex), rewardGoldMultiplier: reward.goldMultiplier, rewardXpMultiplier: reward.xpMultiplier, efficiencyIndex: round(efficiencyIndex) });
            }
    return samples;
}
export function auditHeroLongRunEfficiency() {
    const samples = heroLongRunEfficiencySamples();
    let maxHeroEfficiencySpread = 1, minThreatFiveRetention = 1, minTwelveHourRetention = 1, threatMonotonic = true;
    for (const threat of THREATS)
        for (const hours of HOURS) {
            const values = HERO_PROFILES.map((hero) => samples.find((sample) => sample.heroId === hero.id && sample.threat === threat && sample.hours === hours).efficiencyIndex);
            maxHeroEfficiencySpread = Math.max(maxHeroEfficiencySpread, Math.max(...values) / Math.max(.0001, Math.min(...values)));
        }
    for (const hero of HERO_PROFILES)
        for (const hours of HOURS) {
            const t0 = samples.find((sample) => sample.heroId === hero.id && sample.threat === 0 && sample.hours === hours).efficiencyIndex;
            const t3 = samples.find((sample) => sample.heroId === hero.id && sample.threat === 3 && sample.hours === hours).efficiencyIndex;
            const t5 = samples.find((sample) => sample.heroId === hero.id && sample.threat === 5 && sample.hours === hours).efficiencyIndex;
            minThreatFiveRetention = Math.min(minThreatFiveRetention, t5 / Math.max(.0001, t0));
            if (!(t0 > t3 && t3 > t5))
                threatMonotonic = false;
        }
    for (const hero of HERO_PROFILES)
        for (const threat of THREATS) {
            const early = samples.find((sample) => sample.heroId === hero.id && sample.threat === threat && sample.hours === 2).efficiencyIndex;
            const late = samples.find((sample) => sample.heroId === hero.id && sample.threat === threat && sample.hours === 12).efficiencyIndex;
            minTwelveHourRetention = Math.min(minTwelveHourRetention, late / Math.max(.0001, early));
        }
    maxHeroEfficiencySpread = round(maxHeroEfficiencySpread);
    minThreatFiveRetention = round(minThreatFiveRetention);
    minTwelveHourRetention = round(minTwelveHourRetention);
    const passed = samples.length === 48 && maxHeroEfficiencySpread <= 1.20 && minThreatFiveRetention >= .75 && minTwelveHourRetention >= .92 && threatMonotonic;
    return { samples, maxHeroEfficiencySpread, minThreatFiveRetention, minTwelveHourRetention, threatMonotonic, passed };
}
