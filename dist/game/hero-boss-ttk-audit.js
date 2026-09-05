import { firstSixBossCheckpoints } from './boss-clear-time-audit.js';
import { HERO_PROFILES, heroProfile } from './hero-profiles.js';
import { allHeroReleaseModels, heroReleaseModel } from './hero-release-model.js';
function round(value) { return Math.round(value * 1000) / 1000; }
function bossPower(heroId) {
    const model = heroReleaseModel(heroId);
    const profile = heroProfile(heroId);
    const controlUptime = 1 + (model.controlIndex - 1) * .18;
    const movementUptime = .96 + .04 * (profile.baseSpeed / 285);
    return model.offenseIndex * controlUptime * movementUptime;
}
export function heroBossTtkCheckpoints() {
    const base = firstSixBossCheckpoints();
    const averagePower = allHeroReleaseModels().reduce((sum, model) => sum + bossPower(model.heroId), 0) / HERO_PROFILES.length;
    const points = [];
    for (const hero of HERO_PROFILES) {
        const power = bossPower(hero.id);
        for (const boss of base) {
            points.push({
                heroId: hero.id,
                ordinal: boss.ordinal,
                spawnSecond: boss.spawnSecond,
                healthMultiplier: boss.healthMultiplier,
                damageMultiplier: boss.damageMultiplier,
                bossPowerIndex: round(power),
                clearSeconds: round(boss.clearSeconds * averagePower / Math.max(.1, power)),
            });
        }
    }
    return points;
}
export function auditHeroBossTtk() {
    const checkpoints = heroBossTtkCheckpoints();
    const bosses = Array.from({ length: 6 }, (_, ordinal) => {
        const values = checkpoints.filter((point) => point.ordinal === ordinal).map((point) => point.clearSeconds);
        const minTtk = Math.min(...values), maxTtk = Math.max(...values);
        return { ordinal, minTtk: round(minTtk), maxTtk: round(maxTtk), spread: round(maxTtk / Math.max(.001, minTtk)) };
    });
    const maxHeroTtkSpread = round(Math.max(...bosses.map((boss) => boss.spread)));
    let maxAdjacentBossRatio = 1;
    for (const hero of HERO_PROFILES) {
        const points = checkpoints.filter((point) => point.heroId === hero.id).sort((a, b) => a.ordinal - b.ordinal);
        for (let i = 1; i < points.length; i++)
            maxAdjacentBossRatio = Math.max(maxAdjacentBossRatio, points[i].clearSeconds / Math.max(.001, points[i - 1].clearSeconds));
    }
    maxAdjacentBossRatio = round(maxAdjacentBossRatio);
    const heroSpreadBounded = maxHeroTtkSpread <= 1.30;
    const adjacentGrowthBounded = maxAdjacentBossRatio <= 1.35;
    const clearWindowsBounded = checkpoints.every((point) => point.clearSeconds >= 15 && point.clearSeconds <= 75);
    const lateNeutral = checkpoints.filter((point) => point.ordinal >= 3).every((point) => point.healthMultiplier === 1 && point.damageMultiplier === 1);
    return { checkpoints, bosses, maxHeroTtkSpread, maxAdjacentBossRatio, heroSpreadBounded, adjacentGrowthBounded, clearWindowsBounded, lateNeutral, passed: heroSpreadBounded && adjacentGrowthBounded && clearWindowsBounded && lateNeutral };
}
