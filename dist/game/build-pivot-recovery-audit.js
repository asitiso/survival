import { completedBuildMetaSamples } from './completed-build-meta-audit.js';
import { HERO_PROFILES } from './hero-profiles.js';
const MINUTES = [30, 60, 120];
const THREATS = [0, 3, 5];
const AXES = ['relic', 'fusion', 'finalForm', 'archetype'];
function round(value) { return Math.round(value * 10000) / 10000; }
function score(sample, minute) {
    const economyWeight = minute === 30 ? .08 : minute === 60 ? .04 : .01;
    const survivalWeight = minute === 30 ? .05 : minute === 60 ? .03 : .01;
    return sample.compositeIndex * Math.pow(sample.economyIndex, economyWeight) * Math.pow(sample.survivalIndex, survivalWeight);
}
function fusionKey(sample) { return [...sample.fusionIds].sort().join('+'); }
function differsOnlyOn(reference, candidate, axis) {
    if (reference.heroId !== candidate.heroId || reference.threat !== candidate.threat)
        return false;
    const sameRelic = reference.relicId === candidate.relicId;
    const sameFusion = fusionKey(reference) === fusionKey(candidate);
    const sameForm = reference.finalFormId === candidate.finalFormId;
    const sameArchetype = reference.archetype === candidate.archetype;
    if (axis === 'relic')
        return !sameRelic && sameFusion && sameForm && sameArchetype;
    if (axis === 'fusion')
        return sameRelic && !sameFusion && sameForm && sameArchetype;
    if (axis === 'finalForm')
        return sameRelic && sameFusion && !sameForm && sameArchetype;
    return sameRelic && sameFusion && sameForm && !sameArchetype;
}
export function buildPivotRecoverySamples() {
    const builds = completedBuildMetaSamples();
    const samples = [];
    for (const hero of HERO_PROFILES)
        for (const threat of THREATS)
            for (const minute of MINUTES) {
                const group = builds.filter((sample) => sample.heroId === hero.id && sample.threat === threat);
                const reference = group.reduce((best, candidate) => score(candidate, minute) > score(best, minute) ? candidate : best);
                const referenceScore = score(reference, minute);
                for (const axis of AXES) {
                    const alternatives = group.filter((candidate) => differsOnlyOn(reference, candidate, axis));
                    const pivot = alternatives.reduce((best, candidate) => score(candidate, minute) > score(best, minute) ? candidate : best);
                    const pivotScore = score(pivot, minute);
                    const recoveryRatio = round(pivotScore / referenceScore);
                    samples.push({ heroId: hero.id, threat, minute, axis, referenceScore: round(referenceScore), pivotScore: round(pivotScore), recoveryRatio, recoveryLoss: round(1 - recoveryRatio) });
                }
            }
    return samples;
}
export function auditBuildPivotRecovery() {
    const samples = buildPivotRecoverySamples();
    const minRecoveryRatio = round(Math.min(...samples.map((sample) => sample.recoveryRatio)));
    const maxRecoveryLoss = round(Math.max(...samples.map((sample) => sample.recoveryLoss)));
    let maxHeroRecoverySpread = 1, threatParity = true;
    for (const minute of MINUTES)
        for (const axis of AXES) {
            const heroFloors = HERO_PROFILES.map((hero) => Math.min(...samples.filter((sample) => sample.heroId === hero.id && sample.minute === minute && sample.axis === axis).map((sample) => sample.recoveryRatio)));
            maxHeroRecoverySpread = Math.max(maxHeroRecoverySpread, Math.max(...heroFloors) / Math.max(.0001, Math.min(...heroFloors)));
        }
    for (const hero of HERO_PROFILES)
        for (const minute of MINUTES)
            for (const axis of AXES) {
                const ratios = THREATS.map((threat) => samples.find((sample) => sample.heroId === hero.id && sample.threat === threat && sample.minute === minute && sample.axis === axis).recoveryRatio);
                if (Math.max(...ratios) - Math.min(...ratios) > .0001)
                    threatParity = false;
            }
    maxHeroRecoverySpread = round(maxHeroRecoverySpread);
    const deadPivotCount = samples.filter((sample) => sample.recoveryRatio < .78).length;
    const passed = samples.length === 144 && minRecoveryRatio >= .78 && maxRecoveryLoss <= .22 && maxHeroRecoverySpread <= 1.18 && threatParity && deadPivotCount === 0;
    return { samples, minRecoveryRatio, maxRecoveryLoss, maxHeroRecoverySpread, threatParity, deadPivotCount, passed };
}
